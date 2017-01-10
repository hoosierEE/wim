const WimUI=()=>{
  const chord={
    'C-[':{act:'escape',code:'BracketLeft',mods:[2]},
    'C-g':{act:'escape',code:'KeyG',mods:[2]},
    'C-d':{act:'motion',code:'KeyD',mods:[2]},
    'C-u':{act:'motion',code:'KeyU',mods:[2]},
    'C-v':{act:'visual',code:'KeyV',mods:[2]}};

  const seq=(()=>{/* {Seq:{Action,ReverseName,MsBetween?}} */
    let t={
      fd:{act:'escape',dt:200},
      asdf:{act:'escape',dt:200},
      cc:{act:'phrase'},
      dd:{act:'phrase'},
      yy:{act:'phrase'},
      gg:{act:'phrase'},
      cs:{act:'csurround'},
      ds:{act:'dsurround'},
      ys:{act:'ysurround'}};
    Object.keys(t).map(x=>t[x].rn=[...x].reverse().join(''));
    return t;
  })();

  const atom=(()=>{/* {Char:[Type]} */
    let xs={
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
      tag_start:'t',
      text_object:'0^$%{}()[]<>`"\'bBeEpwWG',
      undo:'u',
      verb:'cdy',
      visual:'vV'
    };
    [[32,127,xs.ascii],[65,90,xs.tag],[97,122,xs.tag]].map(([a,b,o])=>{for(let i=a;i<b;++i){o+=String.fromCharCode(i);}});
    let t={};for(let x in xs){[...xs[x]].map(y=>t[y]?t[y].push(x):t[y]=[x]);}t.Escape=['escape'];
    return t;
  })();

  const leaf=1;
  const st=(n=0)=>{/* State Tree */
    const bt=({bracket: leaf, tag_start:{tag:{tag_end:leaf}}});
    return((x)=>{
      if(n==1){delete x.mult_0; Object.defineProperty(x,'mult_N',{get:function(){return this;}});}
      return x;
    })({
      get mult_0(){return st(1);},
      escape:leaf,
      motion:leaf,
      phrase:leaf,
      text_object:leaf,
      seek:{ascii:leaf},
      verb:{
        motion:leaf,
        phrase:leaf,
        text_object:leaf,
        seek:{ascii:leaf},
        modifier:{seek:{ascii:leaf}, text_object:leaf},
        csurround:{bracket:bt, tag_start:bt},
        dsurround:bt,
        ysurround:{
          bracket:bt,
          modifier:{motion:bt, seek:{ascii:bt}, text_object:bt},
          motion:bt,
          seek:{ascii:bt},
          text_object:bt
        }
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
      if(nst.startsWith(s.rn) && dtc(s)){return s;}
    } return null;
  };

  const atom_check=(n)=>{
    const et=atom[n.KS[0][0]]||[], ns=Object.getOwnPropertyNames(stt);
    for(let i=0;i<et.length;++i){
      if(ns.indexOf(et[i])>-1){return et[i];}
    } return null;
  };

  let current=[], stt=st();
  const state_reset=()=>{console.log('<reset>'); stt=st(); current=[];};

  const isleaf=(e)=>{
    let x=e.act||e, y=stt[x];
    if(x=='escape'){console.log('<esc>');return 1;}
    if(y){
      current.push(x);
      console.log(`(${current}) (${Object.getOwnPropertyNames(y).join(' ')})`);
      if(y==leaf){return 1;}
      else{stt=y;}
    }
    return 0;
  };

  const chk=(input,fn)=>{
    let cki=fn(input);
    return cki && isleaf(cki);
  };

  /* walk_tree; if(invalid|leaf)reset; */
  const update=(input)=>{
    if(chk(input,chord_check) || chk(input,seq_check)){state_reset();}
    else{
      let cki=atom_check(input);
      if(!cki || cki && isleaf(cki)){state_reset();}
    }
  };

  const gs=()=>Object.getOwnPropertyNames(stt);
  return ({update,gs});
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
          pd={'KeyI':[10,5],'KeyR':[2,4]}[rk[1]];
    /* ev.preventDefault() except above */
    if(pd && pd[navigator.platform=='MacIntel'|0]==rk[3]){return;}
    ev.preventDefault();
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
