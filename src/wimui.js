/* Vim-sytle UI
   The state machine design in this class is taken directly from here (Thanks IBM!):
   http://www.ibm.com/developerworks/library/wa-finitemach1/

   Offical WIMUI state transition table is here (x indicates disallowed state):
   https://docs.google.com/spreadsheets/d/1gVKCasnhn3aBtXefvZiW6Ht5fp7YofSgvZtBTXDhdzE/edit?usp=sharing
*/
const WIMUI={
    multiplier:1,
    multiplier_str:['',''],
    get_multiplier(multstr){/* [String] -> Int */ return multstr.reduce((a,b)=>a*(b||1),1)},
    reset_multiplier(){this.multiplier=1; this.multiplier_str=['',''];},
    initial_state:'normal',
    current_state:'normal',

    get atom(){/* {Char:[Type]} */
        delete this.atom;
        let atm={/* {Type:[Char]} */
            mult_0:'123456789',
            mult_N:'0123456789',
            verb:'cdy',
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
        };
        let it={}; for(let s in atm){[...atm[s]].forEach(x=>it[x]?it[x].push(s):it[x]=[s]);}
        return this.atom=it;
    },

    chord:{
        'ESC':{act:'escape',code:'Escape',mods:[-1]},
        'C-[':{act:'escape',code:'BracketLeft',mods:[2]},
        'C-g':{act:'escape',code:'KeyG',mods:[2]},
        'C-d':{act:'motion',code:'KeyD',mods:[2]},
        'C-u':{act:'motion',code:'KeyU',mods:[2]},
        'C-v':{act:'visual_block',code:'KeyV',mods:[2]},
    },

    seq:{
        'fd':{act:'escape'},
    },

    /* methods */
    /* NOTE input can contain: key chords, single keys, and mouse events. */
    handle_evt(input){
        let ek=input.KS[0][0],/* most recently pressed key */
            em=input.KS[3][0],/* most recent combination of modifier keys */
            et=this.atom[ek]||[],/* type of most recently pressed key */
            fd=input.KS[0],/* most recent <N=input.KS_MAXLEN> keys */
            action='nop', fn, ok_chord={}, ok_seq=[];/* results */
        for(let icc in this.chord){
            let i=this.chord[icc], eci=Array.from(input.KC).indexOf(i.code);
            if(eci>-1 && (0>i.mods || i.mods.some(x=>x==em))){ok_chord=i; ok_chord.name=icc; break;}
        }
        for(let isq in this.seq){
            let i=this.seq[isq], len=i.length;
            if(fd.slice(0,len).reverse()==isq){console.log(`matched a sequence: ${isq}`)}
        }

        /* Check chords, then atoms for a valid next command. */
        if(Object.keys(ok_chord).length){
            if(fn=this.tbl[this.current_state][ok_chord.act]){action=ok_chord.act;}
            else{console.log(`chord (${ok_chord.name}) unexpected in state (${this.current_state})`);}
        }
        else{
            for(let i=0;i<et.length;++i){
                console.log(et);
                if(et.length && (fn=this.tbl[this.current_state][et[i]])){action=et[i]; break;}
            }
        }

        /* Action or nop? */
        if(action==='nop'){return;}
        if(!action){fn=this.unexpected_event;}

        /* Compute next state. */
        let next_state=fn.call(this,action); /* try */
        if(!next_state){next_state=this.current_state;} /* fallback 1 */
        if(!this.tbl[next_state]){next_state=this.unexpected_state(action,next_state);} /* fallback 2 */

        console.log(`state: ${next_state}`);

        this.current_state=next_state;
        /* TODO accumulate actual keys and, upon successful state change,
           export the key sequence to external handling function. */
    },

    unexpected_event(e){
        console.log(`unexpected event: ${e}`);
        this.reset_multiplier();
        return this.initial_state;
    },

    unexpected_state(e,s){
        console.log(`unexpected state: ${e}`);
        return this.unexpected_event(e);
    },

    get tbl(){/* {States:{Events()}} */
        delete this.tbl;
        this.tbl={

            normal:{
                mult_0(e){/*this.multiplier_str[0]+=e.val;*/ return 'mult_N';},
                verb(e){return 'verb';},
                text_object(e){/* move_cursor_to_object_if_possible */ return 'normal';},
                motion(e){/* move_cursor_by_motion_if_possible */ return 'normal';},
                visual(e){return 'visual';},
                visual_line(e){return 'visual_line';},
                visual_block(e){return 'visual_block';},
                find_char(e){return 'find_char';},
                insert(e){return 'insert';},
                escape(e){return 'normal';},
                edit(e){/* switch(e){...} */ return 'normal';},
                undo(e){return 'normal';},
                repeat(e){/* repeat_last_thing */ return 'normal';},
            },

            mult_N:{
                mult_N(e){/*this.multiplier_str[0]+=e.val; */ return 'mult_N';},
                verb(e){/*this.multiplier_str[0]*=parseInt(this.multiplier_str[0],10); */ return 'verb';},
                text_object(e){/* go(e) */ return 'normal';},
                motion(e){/* go(e) */ return 'normal';},
                visual(e){return 'visual';},
                visual_line(e){return 'visual_line';},
                visual_block(e){return 'visual_block';},
                find_char(e){/*this.multiplier_str[1]+=e.val; */ return 'find_char';},
                insert(e){return 'insert_N';},
                escape(e){return 'normal';},
                edit(e){return 'normal';},
                undo(e){return 'normal';},
                repeat(e){return 'normal';},
            },

            verb:{
                mult_0(e){/* save n1 */ return 'post_verb';},
                mult_N(e){/* save n1 */ return 'post_verb';},
                verb(e){/* if (verb == earlier verb) do(linewise); */ return 'normal';},
                modifier(e){return 'modifier';},
                text_object(e){/* go(object) */ return 'normal';},
                motion(e){/* go(motion) */ return 'normal';},
                find_char(e){return 'find_char_verb';},
                escape(e){return 'normal';},
            },

            post_verb:{
                verb(e){/* if (post_verb == verb) do(linewise); */ return 'normal';},
                modifier(e){return 'modifier';},
                text_object(e){/* do(object) */ return 'normal';},
                motion(e){/* do(motion) */ return 'normal';},
                find_char(e){return 'find_char_verb';},
                escape(e){return 'normal';},
            },

            modifier:{
                text_object(e){/* do(object) */ return 'normal';},
                motion(e){/* do(motion) */ return 'normal';},
            },

            visual:{
                mult_0(e){/* save n0 */ return 'visual';},
                mult_N(e){/* save n0 */ return 'visual';},
                verb(e){/* do(range) */ return 'normal';},
                text_object(e){/* go(object) */ return 'visual';},
                motion(e){/* go(motion) */ return 'visual';},
                visual(e){return 'normal';},
                visual_line(e){return 'visual_line';},
                visual_block(e){return 'visual_block';},
                find_char(e){return 'find_char_visual';},
                insert(e){return 'insert';},
                escape(e){return 'normal';},
                edit(e){/* edit() */ return 'normal';},
            },

            visual_line:{
                mult_0(e){/* save n0 */ return 'visual_line';},
                mult_N(e){/* save n0 */ return 'visual_line';},
                verb(e){/* do(linewise) */ return 'normal';},
                text_object(e){/* go(object) */ return 'visual_line';},
                motion(e){/* go(motion) */ return 'visual_line';},
                visual(e){return 'visual';},
                visual_line(e){return 'visual_line';},
                visual_block(e){return 'normal';},
                find_char(e){return 'find_char_visual_line';},
                insert(e){/* if(AIS) */ return 'insert_block';},
                escape(e){return 'normal';},
                edit(e){/* edit() */ return 'normal';},
            },

            visual_block:{
                mult_0(e){/* save n0 */ return 'visual_line';},
                mult_N(e){/* save n0 */ return 'visual_line';},
                verb(e){/* do(linewise) */ return 'normal';},
                text_object(e){/* go(object) */ return 'visual_block';},
                motion(e){/* go(motion) */ return 'visual_block';},
                visual(e){return 'visual';},
                visual_line(e){return 'visual_line';},
                visual_block(e){return 'normal';},
                find_char(e){return 'find_char_visual_block';},
                insert(e){/* if(AIS) */ return 'insert_block';},
                escape(e){return 'normal';},
                edit(e){/* edit() */ return 'normal';},
            },

            /* TODO implement ascii(e) */
            find_char:{
                escape(e){return 'normal'},
                ascii(e){/* go(range) */ return 'normal';},
            },

            find_char_visual:{
                escape(e){return 'normal'},
                ascii(e){/* go(range) */ return 'visual';},
            },

            find_char_visual_line:{
                escape(e){return 'normal'},
                ascii(e){/* go(range) */ return 'visual_line';},
            },

            find_char_visual_block:{
                escape(e){return 'normal'},
                ascii(e){/* go(range) */ return 'visual_block';},
            },

            find_char_verb:{
                escape(e){return 'normal'},
                ascii(e){/* if e is found do(range) */ return 'normal'},
            },

            insert:{
                escape(e){return 'normal';},
                ascii(e){/* put(e) */ return 'insert';},
            },

            insert_N:{
                escape(e){/* put(e) in other lines */ return 'normal';},
                ascii(e){/* put(e) */ return 'insert_N';},
            },

            insert_block:{
                escape(e){/* put(e) in other lines */ return 'normal';},
                ascii(e){/* put(e) */ return 'insert_block';},
            },

            insert_block_N:{
                escape(e){/* put(e) in other lines */ return 'normal';},
                ascii(e){/* put(e) */ return 'insert_block_N';},
            },

        };
        this.tbl.mult_0=this.tbl.mult_N; /* mult_0 is a copy of mult_N */
        return this.tbl;
    },
};
