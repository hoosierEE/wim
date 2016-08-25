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

/* dk_sort : DaKeys -> [RawKey] */
const dk_sort=(dk,field)=>Object.keys(dk).map(x=>dk[x]).sort((x,y)=>x[field]>y[field]);
const by_time=dk=>dk_sort(dk,'timestamp');

/* parse : DaKeys -> Action */
const parse=o=>{};

/* Events -- keyboard and mouse */

/* key_filter : KeyboardEvent -> RawKey */
const key_filter=key_event=>({
    key:key_event.key,
    code:key_event.code,
    timestamp:key_event.timeStamp|0,
    type:key_event.type==='keydown'|0,
    modifier:['altKey','ctrlKey','metaKey','shiftKey']
        .map(y=>key_event[y]|0).reduce((x,y,i,arr)=>x+y*Math.pow(2,arr.length-1-i),0) /* rebase as 0-15 */
});

const DaKeys=[];
const key_handler=x=>{
    const kf=key_filter(x);
    DaKeys[kf.code]=kf;
    if(x.type==='keydown'){
        let let_thru={
            'KeyI':[2,4,10],
            'KeyR':[2,4],
        }[kf.code];
        let_thru?let_thru.every(x=>kf.modifier!==x):true && x.preventDefault();
        console.table(DaKeys);
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
