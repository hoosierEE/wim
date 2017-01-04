// Libs
const WimUI=()=>{
    const chord={
        'C-[':{act:'escape',code:'BracketLeft',mods:[2]},
        'C-g':{act:'escape',code:'KeyG',mods:[2]},
        'C-d':{act:'motion',code:'KeyD',mods:[2]},
        'C-u':{act:'motion',code:'KeyU',mods:[2]},
        'C-v':{act:'visual',code:'KeyV',mods:[2]}};

    const seq=(()=>{/* {Seq:{Action,ReverseName,MinMilliseconds?}} */
        const ts={
            'fd':{act:'escape',dt:500},
            'asdf':{act:'escape',dt:500},
            'gg':{act:'text_object'},
            'cs':{act:'csurround'},
            'ds':{act:'dsurround'},
            'ys':{act:'ysurround'}};
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
            surround:'s',
            tag:' 0123456789=:-',
            tag_end:'/>',
            text_object:'0^$%{}()[]<>`"\'bBeEpwWG',
            undo:'u',
            verb:'cdy',
            visual:'vV'
        };
        for(let i=32;i<127;++i){xs.ascii+=String.fromCharCode(i);}
        for(let i=65;i<90;++i){xs.tag+=String.fromCharCode(i);}/* A-Z */
        for(let i=97;i<122;++i){xs.tag+=String.fromCharCode(i);}/* a-z */
        let t={};for(let x in xs){[...xs[x]].forEach(y=>t[y]?t[y].push(x):t[y]=[x]);}
        t.Escape=['escape'];
        return t;
    })();

    const leaf=1;
    const st=()=>({/* State Tree */
            escape:leaf,
            get mult_0(){// mult_0 (once), then mult_N
                delete this.mult_0;
                Object.defineProperty(this,'mult_N',{get: function(){return this;}});
                return this;
            },
            verb:{
                modifier:{
                    seek:{ascii:leaf},
                    text_object:leaf},
                motion:leaf,
                seek:{ascii:leaf},
                text_object:leaf},
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
                    tag:{tag_end:leaf}}},
            motion:leaf,
            seek:{ascii:leaf},
            text_object:leaf
    });

    const trap=(act,message)=>({act,message});

    const chord_check=(n)=>{ // TODO - signal wrong mod+key chord, not just no match
        for(let x in chord){
            const i=chord[x],
                  has_key=Array.from(n.KC).indexOf(i.code)>-1,
                  has_mod=(0>i.mods)||i.mods.some(y=>y==n.KS[3][0]);
            if(has_mod){
                if(has_key){i.name=x; return i;}
                else{return trap('nop','no such chord');}
            }
        }
        return null;
    };

    const seq_check=(n)=>{
        const nst=n.KS[0].join('');
        const dtgt=(dt,x)=>{/* dt&>/(}.-}:)x */
            let fsts=n.KS[2].slice(0,x.length-1), snds=n.KS[2].slice(1,x.length), res=[];
            for(let i=0;i<fsts.length;++i){res[i]=fsts[i]-snds[i];}
            return res.every(x=>dt>x);
        };
        for(let x in seq){
            const i=seq[x];
            if(nst.startsWith(i.rn)){return (!i.dt||dtgt(i.dt,x))?i:null;}
        }
        return null;
    };

    let current=[], stt=st();
    const state_reset=()=>{stt=st(); current=[];};
    const state_match=(e)=>{
        if(stt[e]){
            current.push(e);
            if(stt[e]==leaf){return 1;}
            else{stt=stt[e];}
        }
        return 0;
    };

    const update=(input)=>{
        const [okc,oks]=[chord_check(input),seq_check(input)];
        if(okc && state_match(okc.act)){state_reset();}
        else if(oks && state_match(oks.act)){state_reset();}
        else{
            const et=atom[input.KS[0][0]]||[];
            for(let i=0;i<et.length;++i){if(state_match(et[i])){state_reset(); break;}}
        }
    };
    return ({update,st,seq});
};


// Impl
const ctx=document.getElementById('c').getContext('2d'),
      wui=WimUI(),
      kh={KC:new Set(), KS:[[],[],[],[]], KS_MAXLEN:10};// {KeyChord}, [[Key],[Code],[Millis],[ModCode]]

/* key_handler : KeyboardEvent -> u1 -> IO() */
const key_handler=(ev,is_keydown)=>{
    kh.KC[is_keydown?'add':'delete'](ev.code);
    if(is_keydown){
        const rk=[ev.key, ev.code, ev.timeStamp|0,
                  ['altKey','ctrlKey','metaKey','shiftKey']
                  .reduce((a,b,i)=>a|((ev[b]|0)<<i),0)],
              /* ev.preventDefault() if none of these chords match. */
              pd={'KeyI':[5,10], /* Ctrl-I or Cmd-Opt-i */
                  'KeyR':[2,4]   /* Ctrl-r or Cmd-r */
                 }[rk[1]];pd?pd.every(m=>rk[3]!==m):true&&ev.preventDefault();
        rk.forEach((_,i)=>{kh.KS[i].unshift(rk[i]); kh.KS[i]=kh.KS[i].slice(0,kh.KS_MAXLEN);});
        requestAnimationFrame((ms)=>{wui.update(kh);});
    }
};
window.addEventListener('keydown',(e)=>key_handler(e,1));
window.addEventListener('keyup',(e)=>key_handler(e,0));

const render=(lines)=>{/* String -> IO() */
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    let pos=20; lines.replace(/\. +/g,'.\n').split('\n').forEach(l=>{ctx.fillText(l,20,pos+=30);});
};

let str="This is Ginger. She is a linx and has a glowing blue mane that she shakes to get warm. She likes to make fire sparks out of her tail. Her favorite thing to eat is peppers so she can make her sparks. Ginger lives with her linx family. She has friends that are birds. They live together in the forest. The trees are magical so they don't get burned down. She likes living in the forest. ";
const winevts=()=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    ctx.scale(dpr,dpr);
    [ctx.canvas.height,ctx.canvas.width]=[h,w].map(x=>dpr*x);
    [ctx.canvas.style.height,ctx.canvas.style.width]=[h,w].map(x=>x+'px');
    // fonts AFTER canvas mod
    ctx.font=(18*dpr)+'px "Source Code Pro for Powerline"';
    render(str);
};
window.addEventListener('load',winevts);
window.addEventListener('resize',winevts);
