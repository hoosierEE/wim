/* wim -- modal text editor */
'use strict';
const ctx=document.getElementById('c').getContext('2d');

const testwrite=(c)=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    c.font='16px monospace';
    c.fillText('hello canvas on a high dpi screen',20,30);
};

/* TODO keyboard input
   - escape sequences: Ctrl+], 'fd' in rapid sequence, and <ESC>
   - quit-anything: Ctrl+g
   - motions aren't recorded
   - edits are saved to a fixed-length queue for undo purposes
*/
const rsz=(c)=>{
    let dpr=window.devicePixelRatio;
    const h=window.innerHeight, w=window.innerWidth;
    [c.canvas.height,c.canvas.width]=[h,w].map(x=>(dpr?dpr:1)*x);
    [c.canvas.style.height,c.canvas.style.width]=[h,w].map(x=>x+'px');
    c.scale(dpr,dpr);
    testwrite(c);
};

window.addEventListener('resize',()=>{rsz(ctx);});
window.addEventListener('DOMContentLoaded',()=>{rsz(ctx);});
