'use strict';
/* Parser.js -- transforms keyboard input into tokens.
 + key_handler: KeyboardEvent -> ModifiedKeyboardEvent && ()
 + update: ModifiedKeyboardEvent -> ParserStatus

 key_handler ALSO updates the global variable KC, which holds all the currently-pressed keys.
 I know, I know.

 Currently key_handler calls update directly, but if update becomes a bottleneck
 it can instead be enqueued via requestAnimationFrame, or maybe even put into a Worker thread. */
const Parser=(logging=0)=>{
  const chord=[
    {code:'BracketLeft',type:'escape',mods:[2]},
    {code:'KeyG',type:'escape',mods:[2]},
    {code:'KeyD',type:'motion',mods:[2]},
    {code:'KeyU',type:'motion',mods:[2]},
    {code:'KeyF',type:'motion',mods:[2]},
    {code:'KeyB',type:'motion',mods:[2]},
    {code:'KeyH',type:'motion',mods:[2]},
    {code:'KeyJ',type:'motion',mods:[2]},
    {code:'KeyK',type:'motion',mods:[2]},
    {code:'KeyL',type:'motion',mods:[2]},
    {code:'KeyV',type:'visual',mods:[2]}
  ];

  const seq=[
    {rn:'df',type:'escape',dt:200},
    {rn:'cc',type:'phrase'},
    {rn:'dd',type:'phrase'},
    {rn:'yy',type:'phrase'},
    {rn:'gg',type:'phrase'},
    {rn:'``',type:'phrase'},
    {rn:'sc',type:'csurround'},
    {rn:'sd',type:'dsurround'},
    {rn:'sy',type:'ysurround'}
  ];

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

  /* Infernal State Variables  */
  let inq=[], stt=st(), vals={keys:[],mods:[],part:[]};
  const get_stt=()=>stt;
  const reset_stt=()=>{stt=st(); inq=[]; vals={keys:[],mods:[],part:[]};};

  const maybe_chord=(n)=>{
    const m=n[0].mods; if(!m){return null;}
    const kc=n[0].chord; if(kc.length<2){return null;}
    for(let {code:cc, mods:cm, type:ct} of chord){
      const keyp=kc.includes(cc),
            modp=cm.some(y=>y===m);
      if(modp && keyp){return ({type:ct, take:kc.length});}
    } return null;
  };

  const maybe_seq=(n)=>{
    const ns=n.map(x=>x.key).join('');
    if(2>ns.length){return null;}
    const dts=n.map(x=>x.ts), snds=dts.slice(1),
          deltas=(a,b)=>!a || dts.slice(0,b.length-1).map((x,i)=>x-snds[i]).every(x=>a>x);
    for(let {rn:sr, dt:sd, type:st} of seq){
      if(ns.startsWith(sr) && deltas(sd,sr)){return ({type:st, take:sr.length});}
    } return null;
  };

  const maybe_atom=(n)=>{
    const a=atom[n[0].key];
    if(!a){return null;}
    const m=n[0].mods, ns=Object.getOwnPropertyNames(stt);
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

  const update=(input)=>{
    inq.unshift(input);/* prepend */
    const fns=[maybe_chord,maybe_seq,maybe_atom],
          R=(a,b)=>{let r={}; if(b&2){r=vals;} if(b&1){reset_stt();} r.status=a; return r;};
    let t=null; for(let fn of fns){
      if((t=fn(inq))){
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
  const key_handler=(e,up)=>{/* First encode/enqueue the input, then schedule an update. */
    KC[up?'delete':'add'](e.code); if(up){return null;}
    const evt={key:e.key, code:e.code, ts:e.timeStamp|0,
               mods:['altKey','ctrlKey','metaKey','shiftKey'].reduce((a,b,i)=>a|((e[b]|0)<<i),0),
               chord:Array.from(KC)},
          ad={'KeyI':[10,5],'KeyR':[2,4]}[evt[1]];/* allow default */
    if(ad && ad[navigator.platform==='MacIntel'|0]===evt.mods){return null;}
    e.preventDefault();
    return update(evt);
  };
  return {key_handler};
};
