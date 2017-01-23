'use strict';
/* Parser.js -- transforms keyboard input into tokens.
 + key_handler: KeyboardEvent -> ModifiedKeyboardEvent
 + update: ModifiedKeyboardEvent -> ParserStatus

 NOTE: These 2 functions communicate implicitly via mutable internal state (kh).
 I know, I know.

 Currently key_handler calls update directly, but if update becomes a bottleneck
 it can instead be enqueued via requestAnimationFrame. */
const Parser=(logging=0)=>{
  const chord={/* ChordName:{Action,KeyCode,[Mods]} */
    'C-[':{type:'escape',code:'BracketLeft',mods:[2]},
    'C-g':{type:'escape',code:'KeyG',mods:[2]},
    'C-d':{type:'motion',code:'KeyD',mods:[2]},
    'C-u':{type:'motion',code:'KeyU',mods:[2]},
    'C-f':{type:'motion',code:'KeyF',mods:[2]},
    'C-b':{type:'motion',code:'KeyB',mods:[2]},
    'C-h':{type:'motion',code:'KeyH',mods:[2]},
    'C-j':{type:'motion',code:'KeyJ',mods:[2]},
    'C-k':{type:'motion',code:'KeyK',mods:[2]},
    'C-l':{type:'motion',code:'KeyL',mods:[2]},
    'C-v':{type:'visual',code:'KeyV',mods:[2]}
  };

  const seq=(()=>{/* {String:{Action,ReverseName,MinimumMsBetween?}} */
    let t={
      fd:{type:'escape',dt:200},
      cc:{type:'phrase'},
      dd:{type:'phrase'},
      yy:{type:'phrase'},
      gg:{type:'phrase'},
      '``':{type:'phrase'},
      cs:{type:'csurround'},
      ds:{type:'dsurround'},
      ys:{type:'ysurround'}
    }; for(let x in t){t[x].rn=[...x].reverse().join('');} return t;
  })();

  const range=(a,b,c=1)=>{let r=[];while(a<b){r.push(a);a+=c;}return r;};
  const atom=(()=>{/* {Char:[Type]} */
    let xs={
      ascii:'',
      bracket:'[{()}]',
      edit:'oOpPrxX~',
      insert:'aAiI',
      leader:' ',
      modifier:'ai',
      motion:'hjkl',
      mult_0:'123456789',
      mult_N:'0123456789',
      repeat:'.',
      search:'/?',
      seek:'fFtT',
      tag:' 0123456789=:-',
      tag_end:'/>',
      tag_start:'t',
      text_object:'0^$%{}()[]<>`"\'bBeEpwWG',
      undo:'u',
      verb:'cdy`',
      visual:'vV'
    };
    [['ascii',32,127,9],['tag',65,90],['tag',97,122]]
      .forEach(([o,x,y,...others])=>{xs[o]+=String.fromCharCode(...range(x,y+1).concat(others));});
    xs.ascii+=String.fromCharCode(9);
    let t={}; for(let x in xs){[...xs[x]].forEach(y=>t[y]?t[y].push(x):t[y]=[x]);}
    t.Enter=['enter']; t.Escape=['escape']; t.Tab=['tab'];
    t.Delete=t.Backspace=['edit'];
    ['Right','Left','Up','Down'].map(x=>t['Arrow'+x]=['arrow']);
    return t;
  })();

  /* Leader Tree */
  const lt=()=>({tab:leaf, ascii:leaf});/* TODO */

  const leaf=1, branch=2, nomatch=3;
  const st=(n=0)=>{/* State Tree */
    const bt=({bracket:leaf, tag_start:{get tag(){return this;}, tag_end:leaf}}),
          re=({enter:leaf, get ascii(){return this;}});
    return((x)=>{
      if(n===1){
        delete x.mult_0;
        Object.defineProperty(x,'mult_N',{get:function(){return this;}});
      } return x;
    })({
      get mult_0(){return st(1);},
      get leader(){return lt();},
      tab:leaf,
      edit:leaf,
      arrow:leaf,
      escape:leaf,
      motion:leaf,
      phrase:leaf,
      repeat:leaf,
      text_object:leaf,
      undo:leaf,
      search:re,
      seek:{ascii:leaf},
      visual:leaf,
      verb:{
        motion:leaf,
        phrase:leaf,
        text_object:leaf,
        seek:{ascii:leaf},
        modifier:{seek:{ascii:leaf}, text_object:leaf},
        csurround:{bracket:bt, tag_start:bt},
        dsurround:{bracket:leaf, tag_start:leaf},
        ysurround:{
          bracket:bt,
          modifier:{motion:bt, seek:{ascii:bt}, text_object:bt},
          motion:bt,
          seek:{ascii:bt},
          text_object:bt}}});
  };

  let stt=st(), vals={keys:[],mods:[],part:[]};
  const get_stt=()=>{return stt;};
  const reset_stt=()=>{stt=st(); vals={keys:[],mods:[],part:[]};};

  const maybe_chord=(n)=>{
    const m=n[0].mods; if(!m){return null;}
    const kc=n[0].chord; if(kc.length<2){return null;}
    for(let x in chord){
      const c=chord[x], keyp=kc.includes(c.code), modp=c.mods.some(y=>y===m);
      if(modp && keyp){return ({type:c.type, take:kc.length});}
    } return null;
  };

  const maybe_seq=(n)=>{
    const ns=n.map(x=>x.key).join('');
    if(2>ns.length){return null;}
    const dts=n.map(x=>x.ts), snds=dts.slice(1),
          deltas=(s)=>!s.dt || dts.slice(0,s.rn.length-1).map((x,i)=>x-snds[i]).every(x=>s.dt>x);
    for(let x in seq){
      let s=seq[x];
      if(ns.startsWith(s.rn) && deltas(s)){return ({type:s.type, take:x.length});}
    } return null;
  };

  const maybe_atom=(n)=>{
    const a=atom[n[0].key];
    console.log(a);
    if(!a){return null;}
    const m=n[0].chord, ns=Object.getOwnPropertyNames(stt);
    for(let i in a){
      if((0===m || 8===m) && ns.includes(a[i])){return ({type:a[i], take:0});}
    } return null;
  };

  /* Input => (leaf|branch|nomatch) */
  const climb_tree=(x)=>{
    let z=stt[x]; if(z){
      vals.part.push(x);
      if(leaf===z){return leaf;}
      stt=z; return branch;
    } return nomatch;
  };

  let inq=[];/* input queue */
  const update=(input)=>{
    inq.unshift(input);/* prepend */
    const fns=[maybe_chord,maybe_seq,maybe_atom],
          R=(a,b)=>{let r={}; if(b&2){r=vals;} if(b&1){reset_stt();} r.status=a; return r;};
    let t=null; for(let i in fns){
      if((t=fns[i](inq))){
        inq=inq.slice(t.take);
        if('escape'===t.type){return R('quit',1);}
        vals.keys.push(input.key);
        vals.mods.push(input.mods);
        t=climb_tree(t.type);
        if(nomatch===t){return R('error',1);}
        if(leaf===t){return R('done',3);}
        if(branch===t){return R('continue',2);}
      }
    }
    if((t=atom[input.key]) && t.includes('ascii')){return R('error',1);}
    if(input.mods){return R('ignore',0);}
    return R('error',1);
  };

  const KC=new Set();
  const key_handler=(ev,up)=>{/* First encode/enqueue the input, then schedule an update. */
    KC[up?'delete':'add'](ev.code); if(up){return null;}
    const evt={key:ev.key, code:ev.code, ts:ev.timeStamp|0,
               mods:['altKey','ctrlKey','metaKey','shiftKey'].reduce((a,b,i)=>a|((ev[b]|0)<<i),0),
               chord:Array.from(KC)},
          ad={'KeyI':[10,5],'KeyR':[2,4]}[evt[1]];/* allow default */
    if(ad && ad[navigator.platform==='MacIntel'|0]===evt.mods){return null;}
    ev.preventDefault();
    return update(evt);
  };
  return {key_handler};
};
