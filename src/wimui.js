/* Vim-sytle UI
   The state machine design in this class is taken directly from here (Thanks IBM!):
   http://www.ibm.com/developerworks/library/wa-finitemach1/

   Offical WIMUI state transition table is here (x indicates disallowed state):
   https://docs.google.com/spreadsheets/d/1gVKCasnhn3aBtXefvZiW6Ht5fp7YofSgvZtBTXDhdzE/edit?usp=sharing
*/
const WIMUI={
    multiplier:1,
    multiplier_str:['',''],
    get_multiplier(multstr){/* [String] -> Int */
        return multstr.reduce((a,b)=>a*(b||1),1)
    },
    reset_multiplier(){this.multiplier=1; this.multiplier_str=['',''];},
    initial_state:'normal',
    current_state:'normal',

    /* Vim command language alphabet, 1 character at a time. */
    SEQS:{/* {Type:[Char]} */
        mult_0:'123456789',
        mult_N:'0123456789',
        verb:'cdvy',
        modifier:'ai',
        text_object:'0^$%{}()[]<>`"\'bBeEpwWG',
        motion:'hjkl',
        edit:'oOpPrxX',
        insert:'aAiI',
        escape:'',
        visual:'v',
        visual_line:'V',
        find_char:'fFtT',
        undo:'u',
        repeat:'.',
        ascii:' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
    },

    /* valid key chords during normal mode */
    CHORDS:{
        BracketLeft:{mods:[2,4],type:'escape'},
        Escape:{mods:[-1],type:'escape'},
        KeyG:{mods:[2],type:'escape'},
        KeyN:{mods:[2],type:'motion'},
        KeyU:{mods:[2],type:'motion'},
        KeyW:{mods:[2],type:'edit'},
    },

    /* An 'inverted' duplicate of SEQS
       Computed and cached upon first use. */
    get SEQINV(){/* {Char:[Type]} */
        delete this.SEQINV;/* (lazy-cache) */
        let itbl={}; /* inverted table */
        for(let s in this.SEQS){
            [...this.SEQS[s]].forEach(x=>{
                if(itbl[x]){itbl[x].push(s);}
                else{itbl[x]=[s];}
            });
        }
        return this.SEQINV=itbl;
    },

    /* methods */
    handle_evt(input){
        /* NOTE input can contain: key chords, sequences, and mouse events. */
        let ek=input.KS[0][0], /* last pressed key */
            em=input.KS[3][0], /* last combination of modifier keys */
            /* currently pressed keys which match a CHORD */
            ec=Array.from(input.KC).map(x=>this.CHORDS[x])
            .filter(Boolean)
            .reduce((a,b)=>{a.push(b); return a;},[]),
            et=this.SEQINV[ek]||[]; /* type of last pressed key */

        console.log(ec);

        /* Try a state transition function based on current state and e. */
        let fn=this.unexpected_event;
        for(let i=0;i<et.length;++i){
            /* TODO First, attempt to match a chord. */

            /* If no chords, attempt to match a sequence. */
            fn=this.TABLE[this.current_state][et[i]];
            if(fn){break;}/* Found one! */
            else{fn=this.unexpected_event;}/* No match found this iteration */
        }

        /* Call state trasition function, get next state. */
        let next_state=fn.call(this,et); /* try */
        if(!next_state){next_state=this.current_state;} /* fallback 1 */
        if(!this.TABLE[next_state]){next_state=this.unexpected_state(et,next_state);} /* fallback 2 */
        console.log(`current: ${this.current_state}, next: ${next_state}`);
        this.current_state=next_state;
        // TODO accumulate actual keyseq and send to handling function (in buffer?)
    },

    unexpected_event(e){
        console.log(`unexpected event: ${e}`);
        this.reset_multiplier();
        return this.initial_state;
    },

    unexpected_state(e,s){
        console.log(`unexpected state: ${e}`);
        return unexpected_event(e);
    },

    get TABLE(){/* table of {States:{Events()}} */
        delete this.TABLE;/* lazy-cache */
        this.TABLE={

            normal:{
                mult_0(e){
                    this.multiplier_str[0]+=e.val;
                    return 'mult_N';
                },
                verb(e){return 'verb';},
                text_object(e){
                    // move_cursor_to_object_if_possible
                    return 'normal';
                },
                motion(e){
                    // move_cursor_by_motion_if_possible
                    return 'normal';
                },
                visual(e){return 'visual';},
                visual_line(e){return 'visual_line';},
                visual_block(e){return 'visual_block';},
                find_char(e){return 'find_char';},
                insert(e){return 'insert';},
                escape(e){return 'normal';},
                edit(e){
                    //switch(e){
                    //case'o':
                    //case'O':
                    //}
                    return 'normal';
                },
                undo(e){return 'normal';},
                repeat(e){
                    // repeat_last_thing
                    return 'normal';
                },
            },

            mult_N:{
                mult_N(e){
                    //this.multiplier_str[0]+=e.val;
                    return 'mult_N';
                },
                verb(e){
                    //this.multiplier_str[0]*=parseInt(this.multiplier_str[0],10);
                    return 'verb';
                },
                text_object(e){
                    // go(e)
                    return 'normal';
                },
                motion(e){
                    // go(e)
                    return 'normal';
                },
                visual(e){return 'visual';},
                visual_line(e){return 'visual_line';},
                visual_block(e){return 'visual_block';},
                find_char(e){
                    //this.multiplier_str[1]+=e.val;
                    return 'find_char';
                },
                insert(e){return 'insert_N';},
                escape(e){return 'normal';},
                edit(e){return 'normal';},
                undo(e){return 'normal';},
                repeat(e){return 'normal';},
            },

            verb:{
                mult_0(e){
                    // save n1
                    return 'post_verb';
                },
                mult_N(e){
                    // save n1
                    return 'post_verb';
                },
                verb(e){
                    // if (verb == earlier verb) do(linewise);
                    return 'normal';
                },
                modifier(e){return 'modifier';},
                text_object(e){
                    // go(object)
                    return 'normal';
                },
                motion(e){
                    // go(motion)
                    return 'normal';
                },
                find_char(e){return 'find_char_verb';},
                escape(e){return 'normal';},
            },

            post_verb:{
                verb(e){
                    // if (post_verb == verb) do(linewise);
                    return 'normal';
                },
                modifier(e){return 'modifier';},
                text_object(e){
                    // do(object)
                    return 'normal';
                },
                motion(e){
                    // do(motion)
                    return 'normal';
                },
                find_char(e){return 'find_char_verb';},
                escape(e){return 'normal';},
            },

            modifier:{
                text_object(e){
                    // do(object)
                    return 'normal';
                },
                motion(e){
                    // do(motion)
                    return 'normal';
                },
            },

            visual:{
                mult_0(e){
                    // save n0
                    return 'visual';
                },
                mult_N(e){
                    // save n0
                    return 'visual';
                },
                verb(e){
                    // do(range)
                    return 'normal';
                },
                text_object(e){
                    // go(object)
                    return 'visual';
                },
                motion(e){
                    // go(motion)
                    return 'visual';
                },
                visual(e){return 'normal';},
                visual_line(e){return 'visual_line';},
                visual_block(e){return 'visual_block';},
                find_char(e){return 'find_char_vis';},
                insert(e){return 'insert';},
                escape(e){return 'normal';},
                edit(e){
                    // edit()
                    return 'normal';
                },
            },

            visual_line:{
                mult_0(e){
                    // save n0
                    return 'visual_line';
                },
                mult_N(e){
                    // save n0
                    return 'visual_line';
                },
                verb(e){
                    // do(linewise)
                    return 'normal';
                },
                text_object(e){
                    // go(object)
                    return 'visual_line';
                },
                motion(e){
                    // go(motion)
                    return 'visual_line';
                },
                visual(e){return 'visual';},
                visual_line(e){return 'visual_line';},
                visual_block(e){return 'normal';},
                find_char(e){return 'find_char_visual_line';},
                insert(e){
                    // if(AIS)
                    return 'insert_block';
                },
                escape(e){return 'normal';},
                edit(e){
                    // edit()
                    return 'normal';
                },
            },

            visual_block:{
                mult_0(e){
                    // save n0
                    return 'visual_line';
                },
                mult_N(e){
                    // save n0
                    return 'visual_line';
                },
                verb(e){
                    // do(linewise)
                    return 'normal';
                },
                text_object(e){
                    // go(object)
                    return 'visual_line';
                },
                motion(e){
                    // go(motion)
                    return 'visual_line';
                },
                visual(e){return 'visual';},
                visual_line(e){return 'visual_line';},
                visual_block(e){return 'normal';},
                find_char(e){return 'find_char_visual_block';},
                insert(e){
                    // if(AIS)
                    return 'insert_block';
                },
                escape(e){return 'normal';},
                edit(e){
                    // edit()
                    return 'normal';
                },
            },

            // TODO implement ascii(e)
            find_char:{
                escape(e){return 'normal'},
                ascii(e){
                    // go(range)
                    return 'normal';
                },
            },

            find_char_visual:{
                escape(e){return 'normal'},
                ascii(e){
                    // go(range)
                    return 'find_char_visual';
                },
            },

            find_char_visual_line:{
                escape(e){return 'normal'},
                ascii(e){
                    // go(range)
                    return 'find_char_visual_line';
                },
            },

            find_char_visual_block:{
                escape(e){return 'normal'},
                ascii(e){
                    // go(range)
                    return 'find_char_visual_block';
                },
            },

            find_char_verb:{
                escape(e){return 'normal'},
                ascii(e){
                    // if e is found
                    // do(range)
                    return 'normal'
                },
            },

            insert:{
                ascii(e){
                    // put(e)
                    return 'insert';
                },
            },

            insert_N:{
                ascii(e){
                    // put(e)
                    return 'insert_N';
                },
            },

            insert_block:{
                ascii(e){
                    // put(e)
                    return 'insert_block';
                },
            },

            insert_block_N:{
                ascii(e){
                    // put(e)
                    return 'insert_block_N';
                },
            },

        };
        this.TABLE.mult_0=this.TABLE.mult_N; /* mult_0 is a copy of mult_N */
        return this.TABLE;
    },
};

