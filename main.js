/* wim -- modal text editor */
'use strict';

const ctx=document.getElementById('c').getContext('2d');

/* TODO keyboard input
   - inputs accumulate until they can be recognized as 'operations', then are pushed to history stack
   - 'insert mode' inputs aren't saved
*/

const testwrite=c=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    c.font='16px monospace';
    c.fillText('hello canvas on a high dpi screen',20,30);
};

const rsz=c=>{
    let dpr=window.devicePixelRatio;
    const h=window.innerHeight, w=window.innerWidth;
    [c.canvas.height,c.canvas.width]=[h,w].map(x=>(dpr?dpr:1)*x);
    [c.canvas.style.height,c.canvas.style.width]=[h,w].map(x=>x+'px');
    c.scale(dpr,dpr);
    testwrite(c);
};

/* key_grab : Event -> Bool -> [Bool, String, Float, [Bool]]

 */
const key_grab=(x,y)=>[y,x.key,x.timeStamp,'altKey ctrlKey metaKey shiftKey'.split(' ').map(x=>~~x[x])];
window.addEventListener('keydown',e=>console.log(key_grab(e,1)));
window.addEventListener('keyup',e=>console.log(key_grab(e,0)));
window.addEventListener('resize',()=>rsz(ctx));
window.addEventListener('DOMContentLoaded',()=>rsz(ctx));
