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


/* Parsing commands */

/* dk_sort : DaKeys -> [RawKey]
   DaKeys sorted by 'field' */
const dk_sort=(dk,field)=>to2d(dk).sort((x,y)=>{
    if(x[dk[field]]>y[dk[field]]){return 1}
    if(x[dk[field]]<y[dk[field]]){return -1}
    return 0;
});

/* parse : DaKeys -> Action */
const parse=o=>{
    let ot=dk_sort(o,'timestamp');
};


/* Events -- keyboard and mouse */
const DaKeys={};/* customized KeyboardEvents */
const key_handler=x=>{
    const kf={/* key_filter : KeyboardEvent -> RawKey */
        key:x.key,
        code:x.code,
        timestamp:x.timeStamp|0,
        type:x.type==='keydown'|0,
        mod:['altKey','ctrlKey','metaKey','shiftKey']
            .map(y=>x[y]|0)
            .reduce((a,b,i,arr)=>a+b*Math.pow(2,arr.length-1-i),0),
    };
    DaKeys[x.code]=kf;
    if(kf.type==='keydown'){
        let preventable={
            'KeyI':[5,10],
            'KeyR':[2,4],
        }[kf.code];
        /* call preventDefault() on everything EXCEPT the chords listed above. */
        preventable?preventable.every(m=>kf.mod!==m):true && x.preventDefault();
    }
};
window.addEventListener('keydown',key_handler);
window.addEventListener('keyup',key_handler);


/* Window -- load, resize */
const pix_ratio_fix=c=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    c.canvas.height=c.canvas.height;
    [c.canvas.height,c.canvas.width]=[h,w].map(x=>dpr*x);
    [c.canvas.style.height,c.canvas.style.width]=[h,w].map(x=>x+'px');
    c.font='16px monospace';/* has to be set after modifying c.canvas.anything */
    c.scale(dpr,dpr);
};
const ctx=document.getElementById('c').getContext('2d');
window.addEventListener('resize',()=>pix_ratio_fix(ctx));
window.addEventListener('load',()=>{
    pix_ratio_fix(ctx);
    do_render(ctx); // testing
});
