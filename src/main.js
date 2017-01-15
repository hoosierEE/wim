const WimUI=()=>{
  const chord={/* ChordName:{Action,KeyCode,[Mods]} */
    'C-[':{act:'escape',code:'BracketLeft',mods:[2]},
    'C-g':{act:'escape',code:'KeyG',mods:[2]},
    'C-d':{act:'motion',code:'KeyD',mods:[2]},
    'C-u':{act:'motion',code:'KeyU',mods:[2]},
    'C-v':{act:'visual',code:'KeyV',mods:[2]}
  };

  const seq=(()=>{/* {String:{Action,ReverseName,MsBetween?}} */
    let t={
      fd:{act:'escape',dt:200},
      cc:{act:'phrase'},
      dd:{act:'phrase'},
      yy:{act:'phrase'},
      gg:{act:'phrase'},
      cs:{act:'csurround'},
      ds:{act:'dsurround'},
      ys:{act:'ysurround'}
    }; for(let x in t){t[x].rn=[...x].reverse().join('');} return t;
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
    }; [['ascii',32,127],['tag',65,90],['tag',97,122]]
          .forEach(([o,x,y])=>{for(let i=x;i<y;++i){xs[o]+=String.fromCharCode(i);}});
    let t={};
    for(let x in xs){[...xs[x]].forEach(y=>t[y]?t[y].push(x):t[y]=[x]);}
    t.Enter=['enter']; t.Escape=['escape']; t.Tab=['tab']; return t;
  })();

  const leaf=1, branch=2, nomatch=3;
  const st=(n=0)=>{/* State Tree */
    const bt=({bracket: leaf, tag_start:{get tag(){return this;}, tag_end:leaf}});
    return((x)=>{
      if(n==1){
        delete x.mult_0;
        Object.defineProperty(x,'mult_N',{get:function(){return this;}});
      } return x;
    })({
      get mult_0(){return st(1);},
      escape:leaf,
      motion:leaf,
      phrase:leaf,
      text_object:leaf,
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

  let stt=st(), types=[], vals={keys:[],mods:[]};
  const reset=()=>{stt=st(); types=[], vals={keys:[],mods:[]};};

  const maybe_chord=(n)=>{
    const m=n.KS[3][0]; if(!m){return null;}
    const kc=Array.from(n.KC); if(kc.length<2){return null;}
    for(let x in chord){
      let c=chord[x], keyp=kc.includes(c.code), modp=c.mods.some(y=>y==m);
      if(modp && keyp){return c.act;}
    } return null;
  };

  const maybe_seq=(n)=>{
    const nst=n.KS[0].join(''), dts=n.KS[2], snds=dts.slice(1),
          deltas=(s)=>!s.dt || dts.slice(0,s.rn.length-1).map((x,i)=>x-snds[i]).every(x=>s.dt>x),
          behead=(sl)=>{while(sl-->0){n.KS.forEach(x=>{x.shift();});};};
    for(let x in seq){
      let s=seq[x]; if(nst.startsWith(s.rn) && deltas(s)){behead(s.rn.length); return s.act;}
    } return null;
  };

  const maybe_atom=(n)=>{
    const a=atom[n.KS[0][0]]||[], m=n.KS[3][0], ns=Object.getOwnPropertyNames(stt);
    for(let i in a){
      if((0===m || 8==m) && ns.includes(a[i])){return a[i];}
    } return null;
  };

  /* Input => (leaf|branch|nomatch) */
  const climb_tree=(e)=>{
    let y=stt[e]; if(y){
      types.push(e);
      let nexts=Object.getOwnPropertyNames(y);
      console.log(`(${types.join(' ')}) (${nexts})`);
      if(y==leaf){return leaf;}
      stt=y; return branch;
    } return nomatch;
  };

  /* {KeyChord}, [[Key],[Code],[ms],[Mod]] */
  const kh={KC:new Set(), KS:[[],[],[],[]], KS_MAXLEN:10};
  const key_handler=(ev,up)=>{/* First encode/enqueue the input, then schedule an update. */
    kh.KC[up?'delete':'add'](ev.code); if(up){return;}
    const rk=[ev.key, ev.code, ev.timeStamp|0,
              ['altKey','ctrlKey','metaKey','shiftKey'].reduce((a,b,i)=>a|((ev[b]|0)<<i),0)],
          ad={'KeyI':[10,5],'KeyR':[2,4]}[rk[1]];/* allow default */
    if(ad && ad[navigator.platform=='MacIntel'|0]==rk[3]){return;}
    ev.preventDefault();
    rk.forEach((_,i)=>{kh.KS[i].unshift(rk[i]); kh.KS[i]=kh.KS[i].slice(0,kh.KS_MAXLEN);});
    console.log(wui.update(kh));
  };

  const R=(x,y,z=0)=>{
    if(2==z || 3==z){x=({keys:vals.keys,mods:vals.mods,types});}
    if(1==z || 3==z){reset();}
    x.status=y; return x;
  };

  const fs=[maybe_chord,maybe_seq,maybe_atom];
  const update=(input)=>{
    let a=null, ret={};
    for(let f in fs){
      if((a=fs[f](input))){
        if('escape'==a){return R(ret,'quit',1);}
        vals.keys.push(input.KS[0][0]);
        vals.mods.push(input.KS[3][0]);
        if(nomatch==(a=climb_tree(a))){return R(ret,'error',1);}
        if(leaf==a){return R(ret,'done',3);}
        if(branch==a){return R(ret,'continue',2);}
      }
    }
    if((a=atom[input.KS[0][0]]) && a.includes('ascii')){return R(ret,'error',1);}
    if(input.KS[3][0]){return R(ret,'ignore');}
    return R(ret,'error',1);
  };

  return({update,key_handler});
};


/* Impl */
const ctx=document.getElementById('c').getContext('2d'), wui=WimUI();

/* testing */
const render=(lines)=>{
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  let pos=20; lines.replace(/\. +/g,'.\n').split('\n').forEach(l=>{ctx.fillText(l,20,pos+=30);});
};

const demo_string="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore e dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

/* fit to screen */
const rsz=()=>{
  const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
  ctx.scale(dpr,dpr);
  [ctx.canvas.height,ctx.canvas.width]=[h,w].map(x=>dpr*x);
  [ctx.canvas.style.height,ctx.canvas.style.width]=[h,w].map(x=>x+'px');
  /* fonts AFTER canvas mod */
  ctx.font=(18*dpr)+'px "Source Code Pro for Powerline"';
  render(demo_string);
};

window.addEventListener('keydown',(e)=>wui.key_handler(e,0));
window.addEventListener('keyup',(e)=>wui.key_handler(e,1));
window.addEventListener('load',rsz);
window.addEventListener('resize',rsz);
