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
    console.table(zip(input.KS));
    //console.log(Array.from(input.KC));// chords
};

/* Model -- inputs */
const IN={
    KC:new Set(),/* Key Chord */
    KS:[[],[],[],[]],/* Key Sequence */
};

/* Model -- state machine */
const SM={
    PATTERNS:{
        mult0:[...'123456789'],
        multN:[...'0123456789'],
        verb:[...'cdy'],
        text_object:[...'0^${}()[]<>`"\'bBeEwWG'],
        motion:[...'hjkl'],
        search_char:[...'fFtT'],
        edit:[...'pPr'],
    },
    counter:0,
    get STATES(){delete this.STATES;return this.STATES=Object.keys(this.PATTERNS);},/* cache lazily */
    handle_evt(e){
        const atf=this.fns[this.current_state][e.type];
        if(!atf)atf=this.unexpected_evt;
        const ns=atf.call(this,e);
        if(!ns)ns=this.current_state;
        if(!this.fns[ns])ns=this.undefined_state(e,ns);
        this.current_state=ns;
    },
    unexpected_evt(e){},
    unexpected_state(e,s){},
    fns:{
    },
}

/* Events -- keyboard and mouse */
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
window.addEventListener('resize',()=>pixel_ratio_fix(ctx,ctx.canvas));
window.addEventListener('load',()=>{
    pixel_ratio_fix(ctx,ctx.canvas);
    render(ctx,'test\ning');// testing
});
//window.addEventListener('wheel',w=>console.log(w));
