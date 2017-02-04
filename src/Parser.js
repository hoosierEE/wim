/* Parser.js -- transforms keyboard input into tokens.
 + key_handler :: KeyboardEvent -> State|Object

 key_handler calls update synchronously, but if this someday hurts performance
 it could easily be converted to a requestAnimationFrame callback, or with
 more work, it could be sequestered into a Worker thread.
 */
const Parser=()=>{
  const chord=[
    {code:'BracketLeft',type:'escape',mods:[2]},
    {code:'KeyG',type:'escape',mods:[2]},
    {code:'KeyD',type:'motion',mods:[2]},
    {code:'KeyU',type:'motion',mods:[2]},
    {code:'KeyF',type:'motion',mods:[2]},
    {code:'KeyB',type:'motion',mods:[2]},
    {code:'KeyH',type:'i_motion',mods:[2]},
    {code:'KeyJ',type:'i_motion',mods:[2]},
    {code:'KeyK',type:'i_motion',mods:[2]},
    {code:'KeyL',type:'i_motion',mods:[2]},
    {code:'KeyV',type:'visual',mods:[2]}
  ];

  const sequence=[/* NOTE prefixes of other commands must register here AND in st */
    {code:'fd',type:'escape',dt:200},
    {code:'cc',type:'phrase'},
    {code:'dd',type:'phrase'},
    {code:'yy',type:'phrase'},
    {code:'cs',type:'csurround'},
    {code:'ds',type:'dsurround'},
    {code:'ys',type:'ysurround'},/* ...for example, this... */
    {code:'yss',type:'ysurround_line'}/* ...is a prefix of this. */
  ].map(x=>{x.code=[...x.code].reverse().join('');return x;});

  const atom=(()=>{/* {Char:[Type]} */
    let xs={
      ascii:'',
      bracket:'[{()}]',
      edit:'DJoOpPrxX~',
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
    };
    const range=(a,b,c=1)=>{let r=[];while(a<b){r.push(a);a+=c;}return r;};
    [['ascii',32,127,9],['tag',65,90],['tag',97,122]]
      .forEach(([o,x,y,...others])=>{xs[o]+=String.fromCharCode(...range(x,y+1).concat(others));});
    const less=(a,b)=>{let r=[];for(let i in a){if(!b.includes(a[i])){r.push(a[i]);}}return r;};
    xs.ascii_lite=less(xs.ascii,(xs.bracket+'t<>')).join('');
    let t={}; for(let i in xs){[...xs[i]].forEach(y=>t[y]?t[y].push(i):t[y]=[i]);};
    ['enter','escape','tab'].forEach(x=>{t[x[0].toUpperCase()+x.slice(1)]=[x];});
    ['Down','Left','Right','Up'].map(x=>t['Arrow'+x]=['arrow']);
    t.PageDown=t.PageUp=t.Home=t.End=['motion'];
    t.Delete=t.Backspace=['edit'];
    return t;
  })();

  const leaf=1, branch=2, nomatch=3;

  /* TODO: keep track of different modes. */
  const lt=()=>({tab:leaf, ascii:leaf});/* TODO Leader Tree */

  const st=(n=0)=>{/* State Tree */
    const bt=({ascii_lite:leaf, bracket:leaf, tag_start:{get tag(){return this;}, tag_end:leaf}}),
          re=({enter:leaf, get ascii(){return this;}});
    return ((x)=>{
      if(n===1){/* replace mult_0 with mult_N */
        delete x.mult_0; Object.defineProperty(x,'mult_N',{get:function(){return this;}});
      } return x;
    })({
      get mult_0(){return st(1);},
      get leader(){return lt();},
      tab:leaf,
      edit:leaf,
      arrow:leaf,
      insert:leaf,
      motion:leaf,
      repeat:leaf,
      text_object:leaf,
      undo:leaf,
      search:re,
      seek:{ascii:leaf},
      visual:leaf,
      verb:{
        modifier:{
          seek:{ascii:leaf},
          text_object:leaf},
        motion:leaf,
        phrase:leaf,
        csurround:{bracket:bt, tag_start:bt},
        dsurround:{bracket:leaf, tag_start:leaf},
        ysurround:{
          bracket:bt,
          modifier:{motion:bt, seek:{ascii:bt}, text_object:bt},
          motion:bt,
          seek:{ascii:bt},
          text_object:bt,
          ysurround_line:bt},
        text_object:leaf,
        seek:{ascii:leaf}}});
  };

  const chord_or_null=(n)=>{
    const m=n[0].mods; if(!m){return null;}
    const kc=n[0].chord, mods=['Alt','Control','Meta','Shift'];
    if(kc.every(x=>mods.reduce((a,b)=>a|x.startsWith(b)|0,0))){return ({ignore:1});}
    for(let {code:cc, mods:cm, type:ct} of chord){
      if(kc.includes(cc) && cm.some(y=>y===m)){return ({type:ct, len:kc.length});}
    } return null;
  };

  const sequence_or_null=(n)=>{
    const ns=n.map(x=>x.key).join(''), dts=n.map(x=>x.ts), snds=dts.slice(1),
          fast_enough=(a,b)=>!a || dts.slice(0,b.length-1).map((x,i)=>x-snds[i]).every(x=>a>x);
    for(let {code:sr, dt:sd, type:st} of sequence){
      if(ns.startsWith(sr) && fast_enough(sd,sr)){return ({type:st, len:0});}
    } return null;
  };

  const atom_or_null=(n)=>{
    const types=atom[n[0].key]; if(!types){return null;}
    if(types.join()==='escape'){return ({type:'escape', len:0});}
    const m=!n[0].mods&7,/* mods==(0 or 8) ...Bitwise, for no good reason. */
          ns=Object.getOwnPropertyNames(stt);/* hmm... */
    for(let i in types){
      if(m && ns.includes(types[i])){return ({type:types[i], len:0});}
    } return null;
  };

  /* Input => (leaf|branch|nomatch) */
  const climb_tree=(a)=>{
    let r=stt[a]; if(r){
      vals.part.push(a);
      if(leaf===r){return leaf;}
      stt=r; return branch;
    } return nomatch;
  };

  const fns=[chord_or_null,sequence_or_null,atom_or_null],
        reset=()=>[st(),{keys:[],mods:[],part:[]},[]],
        R=(a,b)=>{let r={};if(2&b){r=vals;}if(1&b){[stt,vals,inq]=reset();}r.status=a;return r;};

  /* State Variables */
  let [stt,vals,inq]=reset();

  /* update -- given a new KeyboardEvent, what changes to the internal state? */
  const update=(input)=>{
    inq.unshift(input);
    for(let fn of fns){
      let t; if((t=fn(inq))){
        inq=inq.slice(t.len);
        if('escape'===t.type){return R('quit',1);}
        if(t.ignore){return R('ignore',0);}
        vals.keys.push(input.key); vals.mods.push(input.mods);
        t=climb_tree(t.type);
        if(nomatch===t){return R('error',1);}
        if(branch===t){return R('continue',2);}
        if(leaf===t){return R('done',3);}
      }
    } return R('error',1);
  };

  const KC=new Set();
  const key_handler=(a,b)=>{
    KC[b?'delete':'add'](a.code); if(b){return null;}
    const evt={key:a.key, code:a.code, ts:a.timeStamp|0,
               mods:parseInt([a.shiftKey,a.metaKey,a.ctrlKey,a.altKey].map(Number).join(''),2),
               chord:Array.from(KC)},
          ad={'Minus':[2,4],'Equal':[2,4],'KeyI':[10,5],'KeyR':[2,4]}[evt.code];/* allow default */
    if(ad && ad[navigator.platform==='MacIntel'|0]===evt.mods){return null;}
    a.preventDefault();
    return update(evt);
  };
  return {key_handler};
};
