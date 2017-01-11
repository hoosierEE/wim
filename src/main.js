const WimUI=()=>{
  const chord={/* ChordName:{Action,KeyCode,[Mods]} */
    'C-[':{act:'escape',code:'BracketLeft',mods:[2]},
    'C-g':{act:'escape',code:'KeyG',mods:[2]},
    'C-d':{act:'motion',code:'KeyD',mods:[2]},
    'C-u':{act:'motion',code:'KeyU',mods:[2]},
    'C-v':{act:'visual',code:'KeyV',mods:[2]}};

  const seq=(()=>{/* {String:{Action,ReverseName,MsBetween?}} */
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
    for(let x in t){t[x].rn=[...x].reverse().join('');}
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
    [['ascii',32,127],['tag',65,90],['tag',97,122]]
      .forEach(([o,x,y])=>{for(let i=x;i<y;++i){xs[o]+=String.fromCharCode(i);}});
    let t={};
    for(let x in xs){[...xs[x]].map(y=>t[y]?t[y].push(x):t[y]=[x]);}
    t.Escape=['escape'];
    return t;
  })();

  const leaf=1;
  const st=(n=0)=>{/* State Tree */
    const bt=({bracket: leaf, tag_start:{tag:{tag_end:leaf}}}),
          build=(x)=>{
            if(n==1){
              delete x.mult_0;
              Object.defineProperty(x,'mult_N',{
                get:function(){return this;}
              });
            } return x;
          },
          t=({
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
              dsurround:{bracket:leaf, tag_start:leaf},
              ysurround:{
                bracket:bt,
                modifier:{motion:bt, seek:{ascii:bt}, text_object:bt},
                motion:bt,
                seek:{ascii:bt},
                text_object:bt
              }
            }
          });
    return build(t);
  };

  let current=[], stt=st();
  const reset=()=>{console.log('<rst>'); stt=st(); current=[];};

  const chord_or_null=(n)=>{/* Input => Maybe Chord */
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

  const seq_or_null=(n)=>{/* Input => Maybe Sequence */
    let nst=n.KS[0].join(''), dts=n.KS[2], snds=dts.slice(1),
        dtc=(s)=>!s.dt || dts.slice(0,s.rn.length-1).map((x,i)=>x-snds[i]).every(x=>s.dt>x);
    for(let x in seq){
      let s=seq[x]; if(nst.startsWith(s.rn) && dtc(s)){return s;}
    } return null;
  };

  const atom_or_null=(n)=>{/* Input => Maybe Atom */
    const et=atom[n.KS[0][0]]||[], ns=Object.getOwnPropertyNames(stt);
    for(let i=0,l=et.length;i<l;++i){
      if(ns.indexOf(et[i])>-1){return et[i];}
    } return null;
  };

  const should_reset=(e)=>{
    let x=e.act||e, y=stt[x];
    if(x=='escape'){return 1;}
    if(y){
      current.push(x);
      console.log(`(${current}) (${Object.getOwnPropertyNames(y).join(' ')})`);
      if(y==leaf){return 1;}
      else{stt=y;} /* TODO -- move shameful side effect to caller */
    } return 0;
  };

  const chk=(input,fn)=>{/* Input -> Maybe (Chord|Seq|Atom) => Bool */
    let cki=fn(input);
    return cki && should_reset(cki);
  };

  const update=(input)=>{/* walk_tree; (invalid || leaf) && reset */
    if(chk(input,chord_or_null)){reset();return;}
    if(chk(input,seq_or_null)){reset();return;}
    let cki=atom_or_null(input);
    if(!cki && input.KS[3][0]){return;}
    if(cki && should_reset(cki)){reset();}
  };
  return({update,seq,atom,chord});
};


/* Impl */
const ctx=document.getElementById('c').getContext('2d'), /* Canvas */
      wui=WimUI(), /* UI Interface */
      kh={KC:new Set(), KS:[[],[],[],[]], KS_MAXLEN:10}; /* {KeyChord}, [[Key],[Code],[ms],[Mod]] */

const key_handler=(ev,up)=>{/* First encode/enqueue the input, then schedule an update. */
  kh.KC[up?'delete':'add'](ev.code); if(up){return;}
  const rk=[ev.key, ev.code, ev.timeStamp|0,
            ['altKey','ctrlKey','metaKey','shiftKey']
            .reduce((a,b,i)=>a|((ev[b]|0)<<i),0)],
        ad={'KeyI':[10,5],'KeyR':[2,4]}[rk[1]];/* allowDefault() */
  if(ad && ad[navigator.platform=='MacIntel'|0]==rk[3]){return;}
  ev.preventDefault();
  rk.forEach((_,i)=>{kh.KS[i].unshift(rk[i]); kh.KS[i]=kh.KS[i].slice(0,kh.KS_MAXLEN);});
  requestAnimationFrame((ms)=>{wui.update(kh);});
};

const render=(lines)=>{/* testing */
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  let pos=20; lines.replace(/\. +/g,'.\n').split('\n').forEach(l=>{ctx.fillText(l,20,pos+=30);});
};

let str="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const rsz=()=>{/* fit to screen */
  const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
  ctx.scale(dpr,dpr);
  [ctx.canvas.height,ctx.canvas.width]=[h,w].map(x=>dpr*x);
  [ctx.canvas.style.height,ctx.canvas.style.width]=[h,w].map(x=>x+'px');
  /* fonts AFTER canvas mod */
  ctx.font=(18*dpr)+'px "Source Code Pro for Powerline"';
  render(str);
};

window.addEventListener('keydown',(e)=>key_handler(e,0));
window.addEventListener('keyup',(e)=>key_handler(e,1));
window.addEventListener('load',rsz);
window.addEventListener('resize',rsz);
