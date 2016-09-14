/* wim -- modal text editor */

/* Testing -- write a string to the canvas */
const read_one=(e,context)=>{
    if(!e.target.files[0]){console.log('no file found');return;}
    const rat=(e)=>{
        let r=new FileReader();
        r.onload=(e)=>render(context,e.target.result);
        r.readAsText(e.target.files[0]);
    };
    rat(e);
};
document.getElementById('file-input').addEventListener('change',(e)=>read_one(e,ctx),false);

const render=(c,lines)=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    let la=lines.split('\n'),pos=0;
    la.map(l=>{
        pos+=20;
        c.fillText(l,20,pos);
    });
};

/* update : AnyEvent -> Action */
const update=(perf_now,input)=>{
    //console.table(SM.decode(input.KS[0].slice(-1)[0]));
    console.log(SM.handle_evt(SM.decode(input.KS[0].slice(-1)[0])));
    //console.log(Array.from(input.KC));// chords
};


/* Model -- inputs */
const IN={
    KC:new Set(),/* Key Chord */
    KS:[[],[],[],[]],/* Key Sequence */
};

/* Model -- state machine */
const SM={
    /* data */
    multiplier:1,
    multiplier_str:'1',
    current_state:'mult0',
    initial_state:'mult0',
    SEQS:{
        mult0:[...'123456789'],
        multN:[...'0123456789'],
        verb:[...'cdy'],
        modifier:[...'ai'],
        text_object:[...'0^${}()[]<>`"\'bBeEwWG'],
        motion:[...'hjkl'],
        search_char:[...'fFtT'],
        edit:[...'aAiIoOpPrxX'],
        undo:[...'u'],
        repeat:[...',.'],
    },
    get STATES(){delete this.STATES;return this.STATES=Object.keys(this.SEQS);},/* lazy-cache */

    /* methods */
    decode(single_key){
        let result=[];
        for(let x in this.SEQS)
            if(this.SEQS[x].indexOf(single_key)>-1)
                result.push({type:x,val:single_key});
        return result;
    },
    handle_evt(e){
        /* Scan array e. If a match is found, use it. */
        let fn=this.unexpected_event,
            ee=null,// event?
            tmp=[...e];// copy e
        while(tmp.length){
            ee=tmp.pop();
            fn=this.FUNS[this.current_state][ee.type];
            console.log(`fn is ${fn}`);
            if(fn){break;}
            else{fn=this.unexpected_event;}
        }

        /* Call appropriate function (or error/cancel) based on calculated "next" state. */
        //let next_state=fn.call(this,ee);
        let next_state=fn(ee);//.call(this,ee);
        if(!next_state)next_state=this.current_state;
        if(!this.FUNS[next_state])next_state=this.unexpected_state(e,next_state);
        this.current_state=next_state;
    },

    unexpected_event(e){
        console.log('unexpected event:');
        console.log(e);
        this.multiplier=1;
        this.multiplier_str='1';
        return this.initial_state;
    },

    unexpected_state(e,s){
        console.log('unexpected state:');
        console.log(s);
        return unexpected_event(e);
    },

    /* state-event transition table */
    get FUNS(){/* lazy-cache */
        delete this.FUNS;
        this.FUNS={
            multN:{
                multN(e){},
                verb(e){},
                text_object(e){
                    // get mult
                    this.multiplier_str='1';
                },
                motion(e){},
                search_char(e){},
                edit(e){},
                undo(e){},
                repeat(e){},
            },
            verb:{
                mult0(e){},
                modifier(e){},
                text_object(e){},
                motion(e){},
                verb(e){
                    // do something to whole line if same as previous verb
                    console.log(e);
                },
            },
            modifier:{
                text_object(e){},
                motion(e){},
            },
            text_object:{
                // do something
            },
            motion:{
                // do something
            },
            search_char:{
                // get any ASCII char
                any_char(e){},
            },
            any_char:{
                // do something
            },
            edit:{
                // do something
            },
        };
        this.FUNS.mult0=this.FUNS.multN;
        return this.FUNS;
    },
}


/* Events -- keyboard */
const key_handler=(x,down,input,updatefn)=>{
    const rk={/* 'reduced' KeyboardEvents */
        key:x.key,
        code:x.code,
        timestamp:x.timeStamp|0,
        mod:['altKey','ctrlKey','metaKey','shiftKey']
            .reduce((a,b,i,arr)=>a+(x[b]|0)*2**(arr.length-1-i),0)/* rebase 4 bits -> Int */
    };

    /* update KC here so requestAnimationFrame always deals with the same facts */
    input.KC[down?'add':'delete'](rk.code);
    if(down){
        /* 1. Call preventDefault() on everything EXCEPT the chords listed below.
           ok_chords are: 1 non-mod key, plus 1 or more mod keys. */
        let ok_chords={
            'KeyI':[5,10],
            'KeyR':[2,4],
            /* whitelist more keyboard shortcuts here if you want */
        }[rk.code];
        ok_chords?ok_chords.every(m=>rk.mod!==m):true && x.preventDefault();

        /* 2. Push each field to their respective fields in KS array. */
        Object.keys(rk).forEach((x,i)=>{
            input.KS[i].push(rk[x]);
            input.KS[i]=input.KS[i].slice(-10);
        });
        requestAnimationFrame(t=>updatefn(t,input));
    }
};
window.addEventListener('keydown',event=>key_handler(event,1,IN,update));/* global IN only referenced here */
window.addEventListener('keyup',event=>key_handler(event,0,IN,update));/* global IN only referenced here */
/* Events -- mouse */
//window.addEventListener('wheel',w=>console.log(w));


/* Window -- load, resize */
const pixel_ratio_fix=(c,cc)=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [cc.height,cc.width]=[h,w].map(x=>dpr*x);
    [cc.style.height,cc.style.width]=[h,w].map(x=>x+'px');
    /* Set font size AFTER modifying canvas! */
    //c.font='16px monospace';
    c.font='16px "Source Code Pro for Powerline"';
    c.scale(dpr,dpr);
};
const ctx=document.getElementById('c').getContext('2d');
window.addEventListener('resize',()=>{
    pixel_ratio_fix(ctx,ctx.canvas);
});
window.addEventListener('load',()=>{
    pixel_ratio_fix(ctx,ctx.canvas);
    render(ctx,'test\ning');// testing
});
