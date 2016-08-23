/* wim -- modal text editor */
'use strict';

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

/* Events -- keyboard and mouse */

/* key_transform : KeyboardEvent:o -> RawKey:o */
const key_transform=key_event=>({
    key:key_event.key,
    code:key_event.code,
    timestamp:key_event.timeStamp|0,
    type:key_event.type==='keydown'|0,
    modifier:['altKey','ctrlKey','metaKey','shiftKey']
        .map(y=>key_event[y]|0).reduce((x,y,i,arr)=>x+y*Math.pow(2,arr.length-1-i),0) /* 0-15 */
});

let DaKeys={};
window.addEventListener('keydown',x=>{
    const kt=key_transform(x);
    DaKeys[kt.code]=kt;
    if(!(kt.code==='KeyI'&&kt.modifier===10||kt.modifier===5)){x.preventDefault()}
    console.table(DaKeys);
});
window.addEventListener('keyup',x=>{const kt=key_transform(x); DaKeys[kt.code]=kt;});

/* Window -- load, resize */
const resize_handler=c=>{
    c.font='16px monospace';
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [c.canvas.height,c.canvas.width]=[h,w].map(x=>dpr*x);
    [c.canvas.style.height,c.canvas.style.width]=[h,w].map(x=>x+'px');
    c.scale(dpr,dpr);
    render(c); // testing
};
const ctx=document.getElementById('c').getContext('2d');
window.addEventListener('resize',()=>resize_handler(ctx));
window.addEventListener('load',()=>resize_handler(ctx));
