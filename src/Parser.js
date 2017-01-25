'use strict';
/* Parser.js -- transforms keyboard input into tokens.
 + key_handler: KeyboardEvent -> ModifiedKeyboardEvent && ()
 + update: ModifiedKeyboardEvent -> ParserStatus

 key_handler ALSO updates the global variable KC, which holds all the currently-pressed keys.
 I know, I know.

 Currently key_handler calls update directly, but if update becomes a bottleneck
 it can instead be enqueued via requestAnimationFrame (minor change),
 or maybe even put into a Worker thread (major change). */
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

  const seq=[/* NOTE -- can be longer than 2 */
    {code:'asdf',type:'escape',dt:200},
    {code:'fd',type:'escape',dt:200},
    {code:'cc',type:'phrase'},
    {code:'dd',type:'phrase'},
    {code:'yy',type:'phrase'},
    {code:'gg',type:'phrase'},
    {code:'``',type:'phrase'}
    {code:'cs',type:'csurround'},
    {code:'ds',type:'dsurround'},
    {code:'yss',type:'ysurroundline'},
    {code:'ys',type:'ysurround'}
  ].map(x=>{x.code=[...x.code].reverse().join(''); return x;});

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
      surround:'s',
      tag:' 0123456789=:-',
      tag_end:'/>',
      tag_start:'t',
      text_object:'0^$%{}()[]<>`"\'bBeEpwWG',
      undo:'u',
      verb:'cdy`',
      visual:'vV'
    }; [['ascii',32,127,9],['tag',65,90],['tag',97,122]]
      .forEach(([o,x,y,...others])=>{xs[o]+=String.fromCharCode(...range(x,y+1).concat(others));});
    xs.ascii+=String.fromCharCode(9);
    let t={}; for(let x in xs){[...xs[x]].forEach(y=>t[y]?t[y].push(x):t[y]=[x]);}
    t.Enter=['enter']; t.Escape=['escape']; t.Tab=['tab'];
    t.Delete=t.Backspace=['edit'];
    ['Right','Left','Up','Down'].map(x=>t['Arrow'+x]=['arrow']);
    return t;
  })();

  const lt=()=>({tab:leaf, ascii:leaf});/* TODO -- Leader Tree */

  const leaf=1, branch=2, nomatch=3;
  const st=(n=0)=>{/* State Tree */
    const bt=({bracket:leaf, tag_start:{get tag(){return this;}, tag_end:leaf}}),
          re=({enter:leaf, get ascii(){return this;}});
    return((x)=>{
      if(n===1){/* replace mult_0 with mult_N */
        delete x.mult_0; Object.defineProperty(x,'mult_N',{get:function(){return this;}});
      } return x;
    })({
      get mult_0(){return st(1);},
      get leader(){return lt();},
      tab:leaf,
      edit:leaf,
      arrow:leaf,
      escape:leaf,
      insert:leaf,
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
        surround:{
          csurround:{bracket:bt, tag_start:bt},
          dsurround:{bracket:leaf, tag_start:leaf},
          ysurround:{
            ysurroundline:bt,
            bracket:bt,
            modifier:{motion:bt, seek:{ascii:bt}, text_object:bt},
            motion:bt,
            seek:{ascii:bt},
            text_object:bt}},
        modifier:{seek:{ascii:leaf}, text_object:leaf}}});
  };

  /* Infernal State Variables  */
  let inq=[], stt=st(), vals={keys:[],mods:[],part:[]};
  const get_stt=()=>stt;

  const maybe_chord=(n)=>{
    const m=n[0].mods; if(!m){return null;}
    const kc=n[0].chord; if(kc.length<2){return null;}
    for(let {code:cc, mods:cm, type:ct} of chord){
      if(kc.includes(cc) && cm.some(y=>y===m)){return ({type:ct, len:kc.length});}
    } return null;
  };

  const maybe_seq=(n)=>{
    const ns=n.map(x=>x.key).join(''); if(2>ns.length){return null;}
    const dts=n.map(x=>x.ts), snds=dts.slice(1),
          deltas=(a,b)=>!a || dts.slice(0,b.length-1).map((x,i)=>x-snds[i]).every(x=>a>x);
    for(let {code:sr, dt:sd, type:st} of seq){
      if(ns.startsWith(sr) && deltas(sd,sr)){return ({type:st, len:sr.length});}
    } return null;
  };

  const maybe_atom=(n)=>{
    const a=atom[n[0].key]; if(!a){return null;}
    const m=n[0].mods, ns=Object.getOwnPropertyNames(stt);
    for(let i in a){
      if((0===m || 8===m) && ns.includes(a[i])){return ({type:a[i], len:0});}
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

  const fns=[maybe_chord,maybe_seq,maybe_atom],
        R=(a,b,c)=>{
        // R=(a,b)=>{
          let r={};
          if(2&b){r=vals;}
          if(1&b){stt=st(); /*inq=[];*/ vals={keys:[],mods:[],part:[]};}
          if(c){inq=[];}
          r.status=a;
          return r;
        };

  const update=(input)=>{
    inq.unshift(input);/* inq =: (input,inq) */
    let t=null; for(let fn of fns){
      if((t=fn(inq))){
        inq=inq.slice(t.len);/* (t.len) }. inq */
        if('escape'===t.type){return R('quit',1,1);} /* reset stt */
        vals.keys.push(input.key);
        vals.mods.push(input.mods);
        t=climb_tree(t.type);
        if(nomatch===t){return R('error',1);} /* reset stt */
        if(leaf===t){return R('done',3,1);} /* reset stt */
        if(branch===t){return R('continue',2);}
      }
    }
    if((t=atom[input.key]) && t.includes('ascii')){return R('wut?',0,1);}/* reset inq */
    if(input.mods){return R('ignore',0);}
    return R('error',1);
  };

  const KC=new Set();
  const key_handler=(a,b)=>{
    KC[b?'delete':'add'](a.code); if(b){return null;}
    const evt={key:a.key, code:a.code, ts:a.timeStamp|0,
               mods:['altKey','ctrlKey','metaKey','shiftKey'].reduce((x,y,z)=>x|((a[y]|0)<<z),0),
               chord:Array.from(KC)},
          ad={'KeyI':[10,5],'KeyR':[2,4]}[evt.code];/* allow default */
    if(ad && ad[navigator.platform==='MacIntel'|0]===evt.mods){return null;}
    a.preventDefault();
    return update(evt);
  };
  return {key_handler};
};
