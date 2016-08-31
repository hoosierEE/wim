/* wim -- modal text editor */
'use strict';
/* Testing -- write a string to the canvas */
const do_render=c=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    const lines=[
        'TODO keyboard input',
        '- inputs accumulate until they can be recognized as \'operations\', then are pushed to history stack',
        '- \'insert mode\' inputs aren\'t saved.'
    ].join('\n');
    c.fillText(lines,20,30);
};


/* update : AnyEvent -> Action */
let glob=[];
const update=perf_timestamp=>{
    glob=sort_by('timestamp',DaKeys);
};


/* Events -- keyboard and mouse */
const DaKeys={};/* customized KeyboardEvents */
const key_handler=x=>{
    const kf={/* KeyboardEvents, filtered */
        key:x.key,
        code:x.code,
        timestamp:x.timeStamp|0,
        type:x.type==='keydown'|0,
        mod:['altKey','ctrlKey','metaKey','shiftKey']
            .map(y=>x[y]|0)
            .reduce((a,b,i,arr)=>a+b*Math.pow(2,arr.length-1-i),0)
    };
    DaKeys[x.code]=kf;
    if(kf.type==='keydown'){
        let allow_default={
            'KeyI':[5,10],
            'KeyR':[2,4],
        }[kf.code];
        /* call preventDefault() on everything EXCEPT the chords listed above. */
        allow_default?allow_default.every(m=>kf.mod!==m):true && x.preventDefault();
    }
    requestAnimationFrame(update);
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
    do_render(ctx); // testing
});
