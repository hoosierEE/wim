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

    const atom=(()=>{/* {Char:[Type]} */
        let xs={/* {Type:[Char]} */
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
        for(let i=32;i<127;++i){as+=String.fromCharCode(i);} xs.ascii=as;
        for(let i=65;i<90;++i){xs.tag+=String.fromCharCode(i);}
        for(let i=97;i<122;++i){xs.tag+=String.fromCharCode(i);}
        let t={};
        for(let x in xs){[...xs[x]].forEach(y=>t[y]?t[y].push(x):t[y]=[x]);}/* invert xs table */
        t.Escape=['escape'];
        return t;
    })();

    const st={/* StateTable : {State:{Event->State}} */
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

    const update=(input)=>{
        /* tokenize input */
        const [ok_chord, ok_seq]=((inn)=>{
            /* Test input for chord. */
            for(let x in chord){
                let i=chord[x];
                if((Array.from(inn.KC).indexOf(i.code)>-1)&&(0>i.mods||i.mods.some(y=>y==inn.KS[3][0]))){
                    i.name=x;
                    return [i,null];
                }
            }
            /* Test input for sequence. */
            for(let x in seq){
                let i=seq[x];
                if(inn.KS[0].join('').startsWith(i.rn)){
                    let j=(!i.dt)?i:(i.dt>inn.KS[2].slice(0,x.length).reduce((a,b)=>a-b))?i:null;
                    return [null,j];
                }
            }
            return [null,null];
        })(input);

        let fn=null;

        const tf=(e,msg)=>{
            /* TODO -- also push to stack */
            try{
                fn=fn[e];
            }
            catch(ex0){
                try{
                    fn=st[e];
                }
                catch(ex1){
                    fn=null;
                }
            }
            if(fn==null){
                console.log(msg);
                return false;
            }
            return true;
        };

        if(tf(ok_chord.act,'bad chord');)
        if(ok_chord){tf(ok_chord.act,'bad chord');}
        else if(ok_seq){tf(ok_seq.act,'bad sequence');}
        else{
            let et=atom[input.KS[0][0]]||[];// console.log(et);
            for(let i=0;i<et.length;++i){
                if(!tf(et[i],'bad atom'))break;
            }
        }

        /* TODO output
         Option 1: Accumulate actual keys and (upon successful state change)
         export the key sequence to external handling function.
         Option 2: Immediately pass (state, key) tuples to handling function.
         */
    };

    const unexpected_event=(e)=>{
        console.log(`unexpected event: ${e}`);
        reset_multiplier();
        return initial_state;
    };

    const unexpected_state=(e,s)=>{
        console.log(`unexpected state: ${s}`);
        return unexpected_event(e);
    };

    return ({update,st});
};
