/* Vim-sytle UI
   The state machine design in this class is taken directly from here (Thanks IBM!):
   http://www.ibm.com/developerworks/library/wa-finitemach1/

   Offical WIMUI state transition table is here (x indicates disallowed state):
   https://docs.google.com/spreadsheets/d/1gVKCasnhn3aBtXefvZiW6Ht5fp7YofSgvZtBTXDhdzE/edit?usp=sharing
*/
const WIMUI=()=>{
    /* simple objects */
    const multiplier=1,
          multiplier_str=['',''],
          get_multiplier=(multstr)=>{/* [String] -> Int */ return multstr.reduce((a,b)=>a*(b||1),1)},
          reset_multiplier=()=>{multiplier=1; multiplier_str=['',''];},
          initial_state='normal',
          current_state='normal';

    const chord={
        'C-[':{act:'escape',code:'BracketLeft',mods:[2]},
        'C-g':{act:'escape',code:'KeyG',mods:[2]},
        'C-d':{act:'motion',code:'KeyD',mods:[2]},
        'C-u':{act:'motion',code:'KeyU',mods:[2]},
        'C-v':{act:'visual_block',code:'KeyV',mods:[2]},
    };

    /* More complex objects - transformed before use. */
    const seq=(()=>{
        let tsq={/* {Seq:{Action,MinMilliseconds?}} */
            'fd':{act:'escape',dt:500},
            'cs':{act:'surround'},
            'ds':{act:'surround'},
            'ys':{act:'surround'},
            /* 'jk':{act:'escape'}, */
        };
        for(let i in tsq){tsq[i].rn=[...i].reverse().join('');}
        return tsq;
    })();

    const atom=(()=>{/* {Char:[Type]} */
        let xs={/* {Type:[Char]} */
            edit:'oOpPrxX',
            find_char:'fFtT',
            insert:'aAiI',
            modifier:'ai',
            motion:'hjkl',
            mult_0:'123456789',
            mult_N:'0123456789',
            repeat:'.',
            text_object:'0^$%{}()[]<>`"\'bBeEpwWG',
            undo:'u',
            verb:'cdy',
            visual:'v',
            visual_line:'V',
        };
        let as='';for(let i=32;i<127;++i){as+=String.fromCharCode(i);} xs.ascii=as;
        let t={};for(let x in xs){[...xs[x]].forEach(y=>t[y]?t[y].push(x):t[y]=[x]);}/* invert xs table */
        t.Escape=['escape'];
        return t;
    })();

    const st=(()=>{/* {State:{Event->State}} */
        let t={
            normal:{
                mult_0(e){/*this.multiplier_str[0]+=e.val;*/ return 'mult_N';},
                verb(e){return 'verb';},
                text_object(e){/* move_cursor_to_object_if_possible */return 'normal';},
                motion(e){/* move_cursor_by_motion_if_possible */return 'normal';},
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
                visual_line(e){return 'normal';},
                visual_block(e){return 'visual_block';},
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
        t.mult_0=t.mult_N;
        return t;
    })();

    const handle_evt=(input)=>{
        let fd=input.KS[0], action='nop', fn, ok_chord={}, ok_seq;

        /* Test input for chord. */
        for(let icc in this.chord){
            let i=this.chord[icc], eci=Array.from(input.KC).indexOf(i.code);
            if(eci>-1 && (0>i.mods || i.mods.some(x=>x==input.KS[3][0]))){
                ok_chord=i;
                ok_chord.name=icc;
                break;
            }
        }

        /* Test input for sequence. */
        let inseq=input.KS[0].join('');
        for(let si in this.seq){
            let i=this.seq[si];
            if(inseq.startsWith(i.rn)){
                if(!i.dt){ok_seq=i;}
                else if(i.dt > input.KS[2].slice(0,si.length).reduce((a,b)=>a-b)){ok_seq=i;}
                break;
            }
        }

        const tf=(e,o,msg)=>{/* Try function */
            if(fn=o.st[o.current_state][e.act]){action=e.act;}
            else{console.log(msg);}
        };
        if(Object.keys(ok_chord).length){/* chord? */ tf(ok_chord,this,'bad chord');}
        else if(ok_seq){/* sequence? */ tf(ok_seq,this,'bad sequence');}
        else{/* single key? */
            let et=atom[input.KS[0][0]]||[]; for(let i=0;i<et.length;++i){
                if(et.length && (fn=st[current_state][et[i]])){action=et[i]; break;}
            }
        }

        /* Action or nop? */
        if(action==='nop'){return;}
        if(!action){fn=unexpected_event;}

        /* Compute next state. */
        let obj={}, next_state=fn.call(this,obj);/* try */
        if(!next_state){next_state=current_state;}/* fallback 1 */
        if(!st[next_state]){next_state=unexpected_state(action,next_state);}/* fallback 2 */
        console.log(`state: ${next_state}`);
        this.current_state=next_state;
        /* TODO accumulate actual keys and, upon successful state change,
           export the key sequence to external handling function. */
    };

    const unexpected_event=(e)=>{
        console.log(`unexpected event: ${e}`);
        this.reset_multiplier();
        return o.initial_state;
    };

    const unexpected_state=(e,s)=>{
        console.log(`unexpected state: ${e}`);
        return unexpected_event(e);
    };

    return ({update:handle_evt});
};
