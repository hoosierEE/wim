/* Vim-sytle UI */
const WIMUI=()=>{
    /* simple objects */
    let current_state='normal';
    const multiplier=1,
          multiplier_str=['',''],
          get_multiplier=(multstr)=>{/* [String] -> Int */ return multstr.reduce((a,b)=>a*(b||1),1);},
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
        'fd':{act:'escape',rn:'df',dt:500}
    };

    const atom=(()=>{/* {Char:[Type]} */
        let xs={/* {Type:[Char]} */
            bracket:'[{()}]',
            edit:'oOpPrxX',
            find_char:'fFtT',
            insert:'aAiI',
            modifier:'ai',
            motion:'hjkl',
            mult_0:'123456789',
            mult_N:'0123456789',
            repeat:'.',
            surround:'s',
            text_object:'0^$%{}()[]<>`"\'bBeEpwWG',
            undo:'u',
            verb:'cdy',
            visual:'vV'
        };
        let as='';
        for(let i=32;i<127;++i){as+=String.fromCharCode(i);} xs.ascii=as;
        let t={};
        for(let x in xs){[...xs[x]].forEach(y=>t[y]?t[y].push(x):t[y]=[x]);}/* invert xs table */
        t.Escape=['escape'];
        return t;
    })();

    const st={/* StateTable : {State:{Event->State}} */
        mult_0:'',
        verb:{
            modifier:{
                seek:'ascii',
                text_object:null
            },
            motion:null,
            seek:'ascii',
            text_object:null
        },
        motion:null,
        seek:'ascii',
        surround:{
            c:{bracket:'bracket'},
            d:'bracket',
            y:{
                bracket:'bracket',
                modifier:{
                    motion:'bracket',
                    seek:{ascii:'bracket'},
                    text_object:'bracket'
                },
                seek:{ascii:'bracket'},
                text_object:'bracket'
            }
        },
        text_object:null
    };

    const update=(input)=>{
        const [ok_chord, ok_seq]=((n)=>{
            /* Test input for chord. */
            for(let x in chord){
                let i=chord[x];
                if((Array.from(n.KC).indexOf(i.code)>-1)&&(0>i.mods||i.mods.some(y=>y==n.KS[3][0]))){
                    i.name=x;
                    return [i,null];
                }
            }
            /* Test input for sequence. */
            for(let x in seq){
                let i=seq[x];
                if(n.KS[0].join('').startsWith(i.rn)){
                    let j=(!i.dt)?i:(i.dt>n.KS[2].slice(0,x.length).reduce((a,b)=>a-b))?i:null;
                    return [null,j];
                }
            }
            return [null,null];
        })(input);

        let action='nop', fn=unexpected_event;
        const tf=(e,msg)=>{
            if((fn=st[current_state][e.act])){action=e.act;}
            else{console.log(msg);}
        };

        if(ok_chord){tf(ok_chord,'bad chord');}
        else if(ok_seq){tf(ok_seq,'bad sequence');}
        else{
            let et=atom[input.KS[0][0]]||[];
            for(let i=0;i<et.length;++i){
                if(et.length && (fn=st[current_state][et[i]])){action=et[i]; break;}
            }
        }

        if(action==='nop'){return;}

        /* Otherwise compute next state. */
        let obj={}, next_state=fn.call(this,obj);
        if(!next_state){next_state=current_state;}
        if(!st[next_state]){next_state=unexpected_state(action,next_state);}

        /* TODO output
         Option 1: Accumulate actual keys and (upon successful state change)
         export the key sequence to external handling function.
         Option 2: Immediately pass (state, key) tuples to handling function.
         */
        current_state=next_state;
    };

    const unexpected_event=(e)=>{
        console.log(`unexpected event: ${e}`);
        reset_multiplier();
        return initial_state;
    };

    const unexpected_state=(e,s)=>{
        console.log(`unexpected state: ${e}`);
        return unexpected_event(e);
    };

    return ({update});
};
