const WIMUI=()=>{
    const chord={/* Highest priority match. */
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

    const atom=(()=>{/* Eventually becomes {Char:[Type]} */
        let xs={/* Begins as {Type:[Char]} */
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

    const chord_check=(n)=>{
        for(let x in chord){
            const i=chord[x],
                  has_key=Array.from(n.KC).indexOf(i.code)>-1,
                  has_mod=(0>i.mods)||i.mods.some(y=>y==n.KS[3][0]);
            if(has_key && has_mod){i.name=x; return i;}
        }
        return null;
    };

    const seq_check=(n)=>{
        const dt_check=(x,y,z)=>(!x||y)?z:null,
              dt_over=(dt,x)=>{
                  let fsts=n.KS[2].slice(0,x.length-1), snds=n.KS[2].slice(1,x.length), res=[];
                  for(let i=0;i<fsts.length;++i){res[i]=fsts[i]-snds[i];}
                  return res.every(x=>dt>x);
              };
        for(let x in seq){
            const i=seq[x], has_seq=n.KS[0].join('').startsWith(i.rn);
            if(has_seq){return dt_check(i.dt,dt_over(i.dt,x),i);}
        }
        return null;
    };

    let current=[], stt=st();
    const state_reset=()=>{stt=st(); current=[];};

    const match_state=(e)=>{
        if(stt[e]){
            current.push(e);
            console.log(current);
            console.log(stt);
            if(stt[e]==leaf){
                console.log("I'm a leaf");
                return 1;
            }
            else{
                stt=stt[e];
            }
        }
        return 0;
    };

    const update=(input)=>{
        const [okc,oks]=[chord_check(input),seq_check(input)];
        console.log([okc,oks]);
        if(okc && match_state(okc.act)){state_reset();}
        else if(oks && match_state(oks.act)){state_reset();}
        else{
            const et=atom[input.KS[0][0]]||[];
            for(let i=0;i<et.length;++i){if(match_state(et[i])){state_reset(); break;}}
        }
    };
    return ({update,st,seq});
};
