/* wim -- modal text editor */
'use strict';

/* TODO keyboard input
   - inputs accumulate until they can be recognized as 'operations', then are pushed to history stack
   - 'insert mode' inputs aren't saved
*/

const testwrite=c=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    c.font='16px monospace';
    c.fillText('hello canvas on a high dpi screen',20,30);
};

const resize_handler=c=>{
    let dpr=window.devicePixelRatio;
    const h=window.innerHeight, w=window.innerWidth;
    [c.canvas.height,c.canvas.width]=[h,w].map(x=>(dpr?dpr:1)*x);
    [c.canvas.style.height,c.canvas.style.width]=[h,w].map(x=>x+'px');
    c.scale(dpr,dpr);
    testwrite(c);
};

/* key_handler : KeyboardEvent -> [UnicodeKey, MillisecondTimestamp, IsKeyDown?, ModifierCode] */
const key_handler=ke=>[
    ke.key,/* unicode */
    ke.timeStamp|0,/* milliseconds */
    ke.type=='keydown'|0,/* 1 if key is down, else 0 */
    /* 4-bit modifier code: Shift = 1, Meta+Shift = 3, etc. */
    ['altKey','ctrlKey','metaKey','shiftKey']
        .map(y=>x[y]|0)
        .reduce((x,y,i,arr)=>x+y*Math.pow(2,arr.length-1-i),0),
];

const Keys=[];
window.addEventListener('keydown',x=>{console.log(x);(Keys.push(key_handler(x)))});
window.addEventListener('keyup',x=>Keys.push(key_handler(x)));

const ctx=document.getElementById('c').getContext('2d');
window.addEventListener('resize',()=>resize_handler(ctx));
window.addEventListener('DOMContentLoaded',()=>resize_handler(ctx));
