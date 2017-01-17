const Wir=(testing=0)=>{
  const chord={/* ChordName:{Action,KeyCode,[Mods]} */
    'C-[':{act:'escape',code:'BracketLeft',mods:[2]},
    'C-g':{act:'escape',code:'KeyG',mods:[2]},
    'C-d':{act:'motion',code:'KeyD',mods:[2]},
    'C-u':{act:'motion',code:'KeyU',mods:[2]},
    'C-f':{act:'motion',code:'KeyF',mods:[2]},
    'C-b':{act:'motion',code:'KeyB',mods:[2]},
    'C-h':{act:'motion',code:'KeyH',mods:[2]},
    'C-j':{act:'motion',code:'KeyJ',mods:[2]},
    'C-k':{act:'motion',code:'KeyK',mods:[2]},
    'C-l':{act:'motion',code:'KeyL',mods:[2]},
    'C-v':{act:'visual',code:'KeyV',mods:[2]}
  };

  const seq=(()=>{/* {String:{Action,ReverseName,MsBetween?}} */
    let t={
      fd:{act:'escape',dt:200},
      cc:{act:'phrase'},
      dd:{act:'phrase'},
      yy:{act:'phrase'},
      gg:{act:'phrase'},
      '``':{act:'phrase'},
      cs:{act:'csurround'},
      ds:{act:'dsurround'},
      ys:{act:'ysurround'}
    }; for(let x in t){t[x].rn=[...x].reverse().join('');} return t;
  })();

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
    [['ascii',32,127],['tag',65,90],['tag',97,122]]
      .forEach(([o,x,y])=>{for(let i=x;i<=y;++i){xs[o]+=String.fromCharCode(i);}});
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

  let stt=st(), vals={keys:[],mods:[],types:[]};
  const reset=()=>{stt=st(); vals={keys:[],mods:[],types:[]};};

  const maybe_chord=(n)=>{
    const m=n.KS[3][0]; if(!m){return null;}
    const kc=Array.from(n.KC); if(kc.length<2){return null;}
    for(let x in chord){
      const c=chord[x], keyp=kc.includes(c.code), modp=c.mods.some(y=>y===m);
      if(modp && keyp){return c.act;}
    } return null;
  };

  const maybe_seq=(n)=>{
    const ns=n.KS[0].join(''); if(2>ns.length){return null;}
    const dts=n.KS[2], snds=dts.slice(1),
          deltas=(s)=>!s.dt || dts.slice(0,s.rn.length-1).map((x,i)=>x-snds[i]).every(x=>s.dt>x);
    for(let x in seq){
      let s=seq[x]; if(0===ns.lastIndexOf(s.rn) && deltas(s)){ return s.act;}
    } return null;
  };

  const maybe_atom=(n)=>{
    const a=atom[n.KS[0][0]]; if(!a){return null;}
    const m=n.KS[3][0], ns=Object.getOwnPropertyNames(stt);
    for(let i in a){
      if((0===m || 8===m) && ns.includes(a[i])){return a[i];}
    } return null;
  };

  /* Input => (leaf|branch|nomatch) */
  const climb_tree=(x)=>{
    let z=stt[x];
    if(z){
      vals.types.push(x);
      if(leaf===z){return leaf;}
      stt=z; return branch;
    } return nomatch;
  };

  const fs=[maybe_chord,maybe_seq,maybe_atom];
  const R=(x,y=0)=>{let r={}; if(y&2){r=vals;} if(y&1){reset();} r.status=x; return r;};
  const update=(input)=>{
    let a=null;
    for(let f in fs){
      if((a=fs[f](input))){
        if('escape'===a){return R('quit',1);}
        vals.keys.push(input.KS[0][0]);
        vals.mods.push(input.KS[3][0]);
        if(nomatch===(a=climb_tree(a))){return R('error',1);}
        if(leaf===a){return R('done',3);}
        if(branch===a){return R('continue',2);}
      }
    }
    if((a=atom[input.KS[0][0]]) && a.includes('ascii')){return R('error',1);}
    if(input.KS[3][0]){return R('ignore');}
    return R('error',1);
  };

  /* {KeyChord}, [[Key],[Code],[ms],[Mod]] */
  const kh={KC:new Set(), KS:[[],[],[],[]], KS_MAXLEN:10};
  const key_handler=(ev,up)=>{/* First encode/enqueue the input, then schedule an update. */
    kh.KC[up?'delete':'add'](ev.code); if(up){return;}
    const rk=[ev.key, ev.code, ev.timeStamp|0,
              ['altKey','ctrlKey','metaKey','shiftKey'].reduce((a,b,i)=>a|((ev[b]|0)<<i),0)],
          ad={'KeyI':[10,5],'KeyR':[2,4]}[rk[1]];/* allow default */
    if(ad && ad[navigator.platform==='MacIntel'|0]===rk[3]){return;}
    ev.preventDefault();
    rk.forEach((_,i)=>{kh.KS[i].unshift(rk[i]); kh.KS[i]=kh.KS[i].slice(0,kh.KS_MAXLEN);});
    let wu=update(kh);
    console.log(JSON.stringify(wu,null,0));
  };

  return testing?
    ({
        atom,
        chord,
        seq,
        vals,
        climb_tree,
        update,
        key_handler,
        kh,
        lt,
        st,
        stt,
        reset
    })
  : ({update,key_handler});
};


/* Impl */
const ctx=document.getElementById('c').getContext('2d'), wir=Wir();

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

const key_handler_down=(e)=>wir.key_handler(e,0),
      key_handler_up=(e)=>wir.key_handler(e,1);
window.addEventListener('keydown',key_handler_down);
window.addEventListener('keyup',key_handler_up);
window.addEventListener('load',rsz);
window.addEventListener('resize',rsz);

const run_tests=()=>{
  const wr=Wir(1);
  console.assert(['ascii','tag','modifier','insert'].every(x=>wr.atom['a']),'atom has proper types');
  console.assert(typeof wr.kh === 'object', 'kh is an object');
};

run_tests();
