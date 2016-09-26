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
        text_object:'0^${}()[]<>`"\'bBeEwWG',
        motion:'hjkl',
        edit:'oOpPrxX',
        insert:'aAiI',
        escape:'~',
        visual:'v',
        visual_line:'V',
        find_char:'fFtT',
        undo:'u',
        repeat:'.',
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
        /* NOTE: input may be a union of key chords, sequences, and mouse events. */
        let e={
            seq_type:this.SEQINV[input.KS[0][0]]||[],
        };
        console.log(e);

        /* Try a state transition function based on current state and e. */
        let fn=this.unexpected_event;
        for(let i=0;i<e.seq_type.length;++i){
            /* First, attempt to match a chord. */
            // TODO
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
                find_char(e){return 'find_char';},
                insert(e){return 'insert';},
                escape(e){return 'normal';},
                edit(e){return 'normal';},
                undo(e){return 'normal';},
                repeat(e){return 'normal';},
            },

            mult_0:{
                mult_N(e){
                    this.multiplier_str[0]+=e.val;
                    return 'mult_N';
                },
                verb(e){
                    this.multiplier_str[0]*=parseInt(this.multiplier_str[0],10);
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
                    this.multiplier_str[1]+=e.val;
                    return 'find_char';
                },
                insert(e){return 'insert_N';},
                escape(e){return 'normal';},
                edit(e){return 'normal';},
                undo(e){return 'normal';},
                repeat(e){return 'normal';},
            },

            mult_N:{
                mult_N(e){},
                verb(e){},
                text_object(e){},
                motion(e){},
                visual(e){},
                visual_line(e){},
                visual_block(e){},
                find_char(e){},
                insert(e){},
                escape(e){},
                edit(e){},
                undo(e){},
                repeat(e){},
            },

            verb:{
                mult_0(e){},
                mult_N(e){},
                verb(e){},
                modifier(e){},
                text_object(e){},
                motion(e){},
                find_char(e){},
                insert(e){},
                escape(e){},
            },

            post_verb:{
                verb(e){},
                modifier(e){},
                text_object(e){},
                motion(e){},
                find_char(e){},
                insert(e){},
                escape(e){},
            },

            modifier:{
                modifier(e){},
                text_object(e){},
                motion(e){},
            },

            visual:{
                mult_0(e){},
                mult_N(e){},
                verb(e){},
                text_object(e){},
                motion(e){},
                visual(e){},
                visual_line(e){},
                visual_block(e){},
                find_char(e){},
                insert(e){},
                escape(e){},
                edit(e){},
            },

            visual_line:{},
            visual_block:{},
            find_char:{},
            find_char_visual:{},
            find_char_visual_line:{},
            find_char_visual_block:{},
            find_char_verb:{},
            insert:{},
            insert_N:{},
            insert_block:{},
            insert_block_N:{},

        };
        this.FUNS.mult0=this.FUNS.multN; /* mult0 is a copy of multN */
        return this.FUNS;
    },
};

