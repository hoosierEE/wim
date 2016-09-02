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
const update=perf_timestamp=>{
    /* what kind of keyboard input did we just get? */
    console.table(zip(KQ).slice(-10));// sequence
    console.log(Array.from(KP));// chords
};

/* Events -- keyboard and mouse */
const KP=new Set();/* Keys Pressed */
const KQ=[[],[],[],[],[]];/* KeyDown Queue -- arrays of key, code, timestamp, mod */
const key_handler=x=>{
    const fk={/* filtered KeyboardEvents */
        key:x.key,
        code:x.code,
        timestamp:x.timeStamp|0,
        down:x.type==='keydown'|0,
        mod:['altKey','ctrlKey','metaKey','shiftKey']
            .map(y=>x[y]|0)
            .reduce((a,b,i,arr)=>a+b*Math.pow(2,arr.length-1-i),0)
    };
    /* update KP here so requestAnimationFrame always deals with the same facts */
    fk.down&&KP.add(fk.code)||KP.delete(fk.code);
    if(fk.down){
        /* Call preventDefault() on everything EXCEPT the chords listed below.
           NOTE: These chords can only be 1 non-mod key, plus 1 or more mod keys. */
        let ok_chords={
            'KeyI':[5,10],
            'KeyR':[2,4],
            /* optionally whitelist more keyboard shortcuts here */
        }[fk.code];
        (ok_chords?ok_chords.every(m=>fk.mod!==m):true) && x.preventDefault();

        /* push each field to their respective fields in KQ array */
        const KQI=Object.keys(fk);
        KQI.map(x=>KQ[KQI.indexOf(x)].push(fk[x]));
        requestAnimationFrame(update);
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
