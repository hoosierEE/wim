const WimUI=()=>{
  const chord={
    'C-[':{act:'escape',code:'BracketLeft',mods:[2]},
    'C-g':{act:'escape',code:'KeyG',mods:[2]},
    'C-d':{act:'motion',code:'KeyD',mods:[2]},
    'C-u':{act:'motion',code:'KeyU',mods:[2]},
    'C-v':{act:'visual',code:'KeyV',mods:[2]}};

  const seq=(()=>{/* {Seq:{Action,ReverseName,MsBetween?}} */
    const ts={
      fd:{act:'escape',dt:200},
      asdf:{act:'escape',dt:200},
      dd:{act:'verb'},
      gg:{act:'text_object'},
      cs:{act:'csurround'},
      ds:{act:'dsurround'},
      ys:{act:'ysurround'}};
    Object.keys(ts).map(x=>ts[x].rn=[...x].reverse().join(''));
    return ts;
  })();

  const atom=(()=>{/* {Char:[Type]} */
    let xs={/* begins as {Type:[Char]} */
      ascii:'',
      bracket:'[{()}]',
      edit:'oOpPrxX',
      seek:'fFtT',
      insert:'aAiI',
      modifier:'ai',
      motion:'hjkl',
      mult_0:'123456789',
      mult_N:'0123456789',
      repeat:'.',
      search:'/?',
      tag:' 0123456789=:-',
      tag_end:'/>',
      text_object:'0^$%{}()[]<>`"\'bBeEpwWG',
      undo:'u',
      verb:'cdy',
      visual:'vV'
    };let sfc=String.fromCharCode;
    for(let i=32;i<127;++i){xs.ascii+=sfc(i);}
    for(let i=65;i<90;++i){xs.tag+=sfc(i);}
    for(let i=97;i<122;++i){xs.tag+=sfc(i);}
    let t={};for(let x in xs){[...xs[x]].forEach(y=>t[y]?t[y].push(x):t[y]=[x]);}t.Escape=['escape'];
    return t;
  })();

  const leaf=1;
  const st=(n=0)=>{/* State Tree */
    let modn=(x)=>{
      if(n==1){delete x.mult_0; Object.defineProperty(x,'mult_N',{get:function(){return this;}});}
      return x;
    };
    return modn({
      escape:leaf,
      motion:leaf,
      phrase:leaf,
      text_object:leaf,
      get mult_0(){return st(1);},
      seek:{ascii:leaf},
      verb:{
        modifier:{
          seek:{ascii:leaf},
          text_object:leaf},
        motion:leaf,
        seek:{ascii:leaf},
        text_object:leaf,
        csurround:{
          bracket:{
            bracket:leaf,
            tag:{tag_end:leaf}},
          tag:{
            bracket:leaf,
            tag_end:leaf}},
        dsurround:{
          bracket:leaf,
          tag:{tag_end:leaf}},
        ysurround:{
          bracket:{
            bracket:leaf,
            tag:{tag_end:leaf}},
          modifier:{
            seek:{
              ascii:{
                bracket:leaf,
                tag:{tag_end:leaf}}},
            motion:{
              bracket:leaf,
              tag:{tag_end:leaf}},
            text_object:{
              bracket:leaf,
              tag:{tag_end:leaf}}},
          motion:{
            bracket:leaf,
            tag:{tag_end:leaf}},
          seek:{
            ascii:{
              bracket:leaf,
              tag:{tag_end:leaf}}},
          text_object:{
            bracket:leaf,
            tag:{tag_end:leaf}}}
      }
    });
  };

  const chord_check=(n)=>{/* Input => Chord? */
    let mod=n.KS[3][0];
    if(mod){
      let kc=Array.from(n.KC);
      for(let x in chord){
        let i=chord[x],
            has_key=kc.indexOf(i.code)>-1,
            has_mod=(0>i.mods)||i.mods.some(y=>y==mod);
        if(has_mod && has_key){i.name=x; return i;}
      }
    } return null;
  };

  const seq_check=(n)=>{/* Input => Sequence? */
    let nst=n.KS[0].join(''),
        dts=n.KS[2],
        snds=dts.slice(1),
        dtc=(s)=>!s.dt || dts.slice(0,s.rn.length-1).map((x,i)=>x-snds[i]).every(x=>s.dt>x);
    for(let x in seq){
      let s=seq[x];
      if(nst.startsWith(s.rn) && dtc(s)){
        return s;
      }
    } return null;
  };

  let current=[], stt=st();
  const state_reset=()=>{stt=st(); current=[];};

  const state_match=(e)=>{
    let x=e.act||e, y=stt[x];
    if(x=='escape'){return 1;}
    if(y){
      current.push(x);
      console.log(`[${current}] ${Object.keys(y).join(' ')}`);
      if(y==leaf){return 1;}
      else{stt=y;}
    }
    return 0;
  };

  const chk=(input,fn)=>{
    let cki=fn(input);
    if(cki){console.log(cki);}
    return cki && state_match(cki);
  };

  /* Walk state tree till leaf or nomatch, then reset */
  const update=(input)=>{
    if(chk(input,chord_check)){state_reset();}
    else if(chk(input,seq_check)){state_reset();}
    else{
      const et=atom[input.KS[0][0]]||[];
      for(let i=0;i<et.length;++i){
        if(state_match(et[i])){
          state_reset(); break;
        }
      }
    }
  };

  const getstt=()=>stt;
  return ({atom,update,getstt});
};


/* Impl */
const ctx=document.getElementById('c').getContext('2d'),
      wui=WimUI(),
      /* {KeyChord}, [[Key],[Code],[ms],[Mod]] */
      kh={KC:new Set(), KS:[[],[],[],[]], KS_MAXLEN:10};

const key_handler=(ev,is_keydown)=>{/* encode, then schedule an update using the encoded event */
  kh.KC[is_keydown?'add':'delete'](ev.code);
  if(is_keydown){
    const rk=[ev.key, ev.code, ev.timeStamp|0,
              ['altKey','ctrlKey','metaKey','shiftKey']
              .reduce((a,b,i)=>a|((ev[b]|0)<<i),0)],
          /* ev.preventDefault() unless match */
          pd={'KeyI':[5,10],/* (Ctrl|Cmd-Opt)-i */
              'KeyR':[2,4]/* (Ctrl|Cmd)-r */
             }[rk[1]];pd?pd.every(m=>rk[3]!==m):true&&ev.preventDefault();
    rk.forEach((_,i)=>{kh.KS[i].unshift(rk[i]); kh.KS[i]=kh.KS[i].slice(0,kh.KS_MAXLEN);});
    requestAnimationFrame((ms)=>{wui.update(kh);});
  }
};
window.addEventListener('keydown',(e)=>key_handler(e,1));
window.addEventListener('keyup',(e)=>key_handler(e,0));

const render=(lines)=>{
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  let pos=20; lines.replace(/\. +/g,'.\n').split('\n').forEach(l=>{ctx.fillText(l,20,pos+=30);});
};

let str="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const winevts=()=>{/* fit to screen */
  const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
  ctx.scale(dpr,dpr);
  [ctx.canvas.height,ctx.canvas.width]=[h,w].map(x=>dpr*x);
  [ctx.canvas.style.height,ctx.canvas.style.width]=[h,w].map(x=>x+'px');
  /* fonts AFTER canvas mod */
  ctx.font=(18*dpr)+'px "Source Code Pro for Powerline"';
  render(str);
};
window.addEventListener('load',winevts);
window.addEventListener('resize',winevts);
