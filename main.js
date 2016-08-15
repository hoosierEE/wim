/* wim -- modal text editor */
'use strict';
const c=document.getElementById('c').getContext('2d');
const testwrite=(c)=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    c.font='20px monospace';
    c.fillText('hello canvas on a high dpi screen',20,30);
};
const rsz=(c)=>{
    let dpr=window.devicePixelRatio;
    const h=window.innerHeight, w=window.innerWidth;
    [c.canvas.height,c.canvas.width]=[h,w].map(x=>(dpr?dpr:1)*x);
    [c.canvas.style.height,c.canvas.style.width]=[h,w].map(x=>x+'px');
    c.scale(dpr,dpr);
    testwrite(c);
};

window.addEventListener('resize',()=>{rsz(c);},false);
window.addEventListener('DOMContentLoaded',()=>{rsz(c);},false);
