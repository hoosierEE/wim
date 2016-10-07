/* Vim-sytle UI */
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
        escape:'~',
        visual:'v',
        visual_line:'V',
        find_char:'fFtT',
        undo:'u',
        repeat:'.',
        ascii:' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
    },

    /* valid key chords during normal mode */
    CHORDS:{
        Escape:[0],
        BracketLeft:[2,4],
        KeyW:[2],
        KeyN:[2],
        KeyU:[2],
        KeyG:[2],
    },

    /* An 'inverted' duplicate of SEQS
       Computed and cached upon first use. */
    get SEQINV(){/* {Char:[Type]} */
        delete this.SEQINV;/* (lazy-cache) */
        let i_table={};
        for(let s in this.SEQS){
            [...this.SEQS[s]].forEach(x=>{
                if(!i_table[x]){i_table[x]=[s];}
                else{i_table[x].push(s);}
            });
        }
        return this.SEQINV=i_table;
    },

    /* methods */
    handle_evt(input){
        /* NOTE input can contain: key chords, sequences, and mouse events. */
        let ek=input.KS[0][0], // last pressed key
            ec=Array.from(input.KC), // down keys
            et=this.SEQINV[ek]||[]; // type of last pressed key

        /* Try a state transition function based on current state and e. */
        let fn=this.unexpected_event;
        for(let i=0;i<e.seq_type.length;++i){
            /* TODO First, attempt to match a chord. */
            /* If no chords, attempt to match a sequence. */
            fn=this.FUNS[this.current_state][e.seq_type[i]];
            if(fn){break;}/* Found one! */
            else{fn=this.unexpected_event;}/* No match found this iteration */
        }

        /* Call state trasition function, get next state. */
        let next_state=fn.call(this,e); // TODO or: let next_state=fn(e);
        if(!next_state){next_state=this.current_state;}
        if(!this.FUNS[next_state]){next_state=this.unexpected_state(e,next_state);}
        this.current_state=next_state;
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

    get FUNS(){/* table of {States:{Events()}} */
        delete this.FUNS;/* lazy-cache */
        this.FUNS={

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

            mult_0:{
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
                mult_0(e):{
                    // save n0
                    return 'visual_line';
                },
                mult_N(e):{
                    // save n0
                    return 'visual_line';
                },
                verb(e):{
                    // do(linewise)
                    return 'normal';
                },
                text_object(e):{
                    // go(object)
                    return 'visual_line';
                },
                motion(e):{
                    // go(motion)
                    return 'visual_line';
                },
                visual(e):{return 'visual';},
                visual_line(e):{return 'visual_line';},
                visual_block(e):{return 'normal';},
                find_char(e):{return 'find_char_visual_line';},
                insert(e):{
                    // if(AIS)
                    return 'insert_block';
                },
                escape(e):{return 'normal';},
                edit(e):{
                    // edit()
                    return 'normal';
                },
            },

            visual_block:{
                mult_0(e):{
                    // save n0
                    return 'visual_line';
                },
                mult_N(e):{
                    // save n0
                    return 'visual_line';
                },
                verb(e):{
                    // do(linewise)
                    return 'normal';
                },
                text_object(e):{
                    // go(object)
                    return 'visual_line';
                },
                motion(e):{
                    // go(motion)
                    return 'visual_line';
                },
                visual(e):{return 'visual';},
                visual_line(e):{return 'visual_line';},
                visual_block(e):{return 'normal';},
                find_char(e):{return 'find_char_visual_block';},
                insert(e):{
                    // if(AIS)
                    return 'insert_block';
                },
                escape(e):{return 'normal';},
                edit(e):{
                    // edit()
                    return 'normal';
                },
            },

            // TODO implement ascii(e)
            find_char:{
                escape(e):{return 'normal'},
                ascii(e):{},
            },
            find_char_visual:{
                escape(e):{return 'normal'},
                ascii(e):{},
            },
            find_char_visual_line:{
                escape(e):{return 'normal'},
                ascii(e):{},
            },
            find_char_visual_block:{
                escape(e):{return 'normal'},
                ascii(e):{},
            },
            find_char_verb:{
                escape(e):{return 'normal'},
                ascii(e):{},
            },

            insert:{
                ascii(e):{
                    // put(e)
                    return 'insert';
                },
            },

            insert_N:{
                ascii(e):{
                    // put(e)
                    return 'insert_N';
                },
            },

            insert_block:{
                ascii(e):{
                    // put(e)
                    return 'insert_block';
                },
            },

            insert_block_N:{
                ascii(e):{
                    // put(e)
                    return 'insert_block_N';
                },
            },

        };
        this.FUNS.mult0=this.FUNS.multN; /* mult0 is a copy of multN */
        return this.FUNS;
    },
};
