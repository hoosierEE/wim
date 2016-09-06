/* wim -- modal text editor */
/* Testing -- write a string to the canvas */
const render=c=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    const lines=[
        'TODO keyboard input',
        '- inputs accumulate until they can be recognized as \'operations\', then are pushed to history stack',
        '- \'insert mode\' inputs aren\'t saved.'
    ].join('\n');
    c.fillText(lines,20,30);
};

/* update : AnyEvent -> Action */
const update=(perf_now,input)=>{
    /* what kind of keyboard input did we just get? */
    console.table(zip(input.KS).slice(-10));// end of sequence
    console.log(Array.from(input.KC));// chords
};

/* Events -- keyboard and mouse */
const INPUT={
    KC:new Set(), /* Key Chord */
    KS:[[],[],[],[],[]],/* Key Sequence */
};

const key_handler=x=>{
    const rk={/* 'reduced' KeyboardEvents */
        key:x.key,
        code:x.code,
        timestamp:x.timeStamp|0,
        down:x.type==='keydown'|0,
        mod:['altKey','ctrlKey','metaKey','shiftKey']
            .map(y=>x[y]|0)
            .reduce((a,b,i,arr)=>a+b*2**(arr.length-1-i),0)};
    /* update KC here so requestAnimationFrame always deals with the same facts */
    rk.down&&INPUT.KC.add(rk.code)||INPUT.KC.delete(rk.code);
    if(rk.down){
        /* 1. Call preventDefault() on everything EXCEPT the chords listed below.
           NOTE: These chords can only be 1 non-mod key, plus 1 or more mod keys. */
        let ok_chords={
            'KeyI':[5,10],
            'KeyR':[2,4],
            /* whitelist more keyboard shortcuts here if you want */
        }[rk.code];
        (ok_chords?ok_chords.every(m=>rk.mod!==m):true) && x.preventDefault();

        /* 2. Push each field to their respective fields in KS array. */
        Object.keys(rk).forEach((x,i)=>INPUT.KS[i].push(rk[x]));
        requestAnimationFrame((t)=>update(t,INPUT));
    }
};
window.addEventListener('keydown',key_handler);
window.addEventListener('keyup',key_handler);

/* Window -- load, resize */
const pixel_ratio_fix=(c,cc)=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [cc.height,cc.width]=[h,w].map(x=>dpr*x);
    [cc.style.height,cc.style.width]=[h,w].map(x=>x+'px');
    //c.font='16px monospace';/* Must set AFTER modifying canvas! */
    c.font='16px "Source Code Pro for Powerline"';/* Must set AFTER modifying canvas! */
    c.scale(dpr,dpr);
};
const canvas=document.getElementById('c'), ctx=canvas.getContext('2d');
window.addEventListener('resize',()=>pixel_ratio_fix(ctx,canvas));
window.addEventListener('load',()=>{
    pixel_ratio_fix(ctx,canvas);
    render(ctx);// testing
});
window.addEventListener('wheel',(w)=>console.log(w));
