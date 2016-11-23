/* Vim-sytle UI */
const WIMUI=()=>{
    /* simple objects */
    let current_state='normal', multiplier=1, multiplier_str=['',''];
    const get_multiplier=(multstr)=>{/* [String] -> Int */ return multstr.reduce((a,b)=>a*(b||1),1);},
          reset_multiplier=()=>{multiplier=1; multiplier_str=['',''];},
          initial_state='normal';

    /* State machine tries to match: Chords, then Sequences, then Atoms. */
    const chord={
        'C-[':{act:'escape',code:'BracketLeft',mods:[2]},
        'C-g':{act:'escape',code:'KeyG',mods:[2]},
        'C-d':{act:'motion',code:'KeyD',mods:[2]},
        'C-u':{act:'motion',code:'KeyU',mods:[2]},
        'C-v':{act:'visual',code:'KeyV',mods:[2]}
    };

    const seq={/* {Seq:{Action,ReverseName,MinMilliseconds?}} */
        'fd':{act:'escape',rn:'df',dt:500},
        'cs':{act:'csurround',rn:'sc'},
        'ds':{act:'dsurround',rn:'sd'},
        'ys':{act:'ysurround',rn:'sy'}
    };

    const atom=(()=>{/* Eventually becomes {Char:[Type]} */
        let xs={/* Starts off as {Type:[Char]} */
            ascii:'',
            bracket:'[{()}]',
            edit:'oOpPrxX',
            find_char:'fFtT',
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
        let as='';
        for(let i=32;i<127;++i){as+=String.fromCharCode(i);}
        xs.ascii=as;
        /* tag doesn't start empty */
        for(let i=65;i<90;++i){xs.tag+=String.fromCharCode(i);}/* A-Z */
        for(let i=97;i<122;++i){xs.tag+=String.fromCharCode(i);}/* a-z */
        let t={};
        for(let x in xs){[...xs[x]].forEach(y=>t[y]?t[y].push(x):t[y]=[x]);}/* invert xs table */
        t.Escape=['escape'];
        return t;
    })();

    const st={/* State Tree */
        get mult_0(){return this;},
        verb:{
            modifier:{
                seek:{ascii:1},
                text_object:1
            },
            motion:1,
            seek:{ascii:1},
            text_object:1
        },
        csurround:{
            bracket:{
                bracket:1,
                tag:{tag_end:1}
            },
            tag:{
                bracket:1,
                tag_end:1
            }
        },
        dsurround:{
            bracket:1,
            tag:{tag_end:1}
        },
        ysurround:{
            bracket:{
                bracket:1,
                tag:{tag_end:1}
            },
            modifier:{
                seek:{ascii:{
                    bracket:1,
                    tag:{tag_end:1}
                }},
                text_object:{
                    bracket:1,
                    tag:{tag_end:1}
                }
            },
            motion:{
                bracket:1,
                tag:{tag_end:1}
            },
            seek:{
                ascii:{
                    bracket:1,
                    tag:{tag_end:1}
                }
            },
            text_object:{
                bracket:1,
                tag:{tag_end:1}
            }
        },
        motion:1,
        seek:{ascii:1},
        text_object:1
    };

    const chord_seq_check=(n)=>{
        for(let x in chord){
            const i=chord[x],
                  has_key=Array.from(n.KC).indexOf(i.code)>-1,
                  has_mod=(0>i.mods)||i.mods.some(y=>y==n.KS[3][0]);
            if(has_key&&has_mod){
                i.name=x;
                return [i,null];
            }
        }
        const dt_check=(x,y,z)=>(!x||y)?z:null;
        for(let x in seq){
            const i=seq[x],
                  has_seq=n.KS[0].join('').startsWith(i.rn);
            if(has_seq){
                const exceeded_timeout=i.dt>n.KS[2].slice(0,x.length).reduce((a,b)=>a-b);
                return [null,dt_check(i.dt,exceeded_timeout,i)];
            }
        }
        return [null,null];
    };

    let fn=st;
    const update=(input)=>{
        [ok_chord,ok_seq]=chord_seq_check(input);

        const match_state=(e,msg)=>{
            if(fn==null){fn=st[e];}
            else if(fn[e]!=null){fn=fn[e];}
            else if(st[e]!=null){fn=st[e];}
            else{fn=null;}
            return fn!=null;
        };

        if(ok_chord!=null){
            match_state(ok_chord.act,'bad chord');
        }
        else if(ok_seq!=null){
            match_state(ok_seq.act,'bad sequence');
        }
        else{
            let et=atom[input.KS[0][0]]||[];// console.log(et);
            for(let i=0;i<et.length;++i){
                //console.log(et[i]);
                if(match_state(et[i],'bad atom')) break;
            }
        }

        console.log(fn);

        /* TODO output
         Option 1: Accumulate actual keys and (upon successful state change)
         export the key sequence to external handling function.
         Option 2: Immediately pass (state, key) tuples to handling function.
         */
    };
    return ({update,st});
};
