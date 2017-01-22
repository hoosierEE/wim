const ctx=document.getElementById('c').getContext('2d'), par=Parser(1);

const pp=(x)=>console.log(JSON.stringify(x));

const render=()=>{
  const lines="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore e dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  let pos=20; lines.replace(/\. +/g,'.\n').split('\n').forEach(l=>{ctx.fillText(l,20,pos+=30);});
};

const rsz=()=>{/* fit to screen */
  const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
  ctx.scale(dpr,dpr);
  [ctx.canvas.height,ctx.canvas.width]=[h,w].map(x=>dpr*x);
  [ctx.canvas.style.height,ctx.canvas.style.width]=[h,w].map(x=>x+'px');
  /* fonts AFTER canvas mod */
  ctx.font=(18*dpr)+'px monospace';
  render();
};

const key_handler_dn=(e)=>pp(par.key_handler(e,0)),
      key_handler_up=(e)=>par.key_handler(e,1);
window.addEventListener('keydown',key_handler_dn);
window.addEventListener('keyup',key_handler_up);
window.addEventListener('load',rsz);
window.addEventListener('resize',rsz);
