const ctx=document.getElementById('c').getContext('2d'), wir=Parser();

const render=(lines)=>{
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  let pos=20; lines.replace(/\. +/g,'.\n').split('\n').forEach(l=>{ctx.fillText(l,20,pos+=30);});
};

/* fit to screen */
const rsz=()=>{
  const demo_string="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore e dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
  const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
  ctx.scale(dpr,dpr);
  [ctx.canvas.height,ctx.canvas.width]=[h,w].map(x=>dpr*x);
  [ctx.canvas.style.height,ctx.canvas.style.width]=[h,w].map(x=>x+'px');
  /* fonts AFTER canvas mod */
  ctx.font=(18*dpr)+'px "Source Code Pro for Powerline"';
  render(demo_string);
};

const key_handler_down=(e)=>wir.key_handler(e,0),
      key_handler_up=(e)=>wir.key_handler(e,1);
window.addEventListener('keydown',key_handler_down);
window.addEventListener('keyup',key_handler_up);
window.addEventListener('load',rsz);
window.addEventListener('resize',rsz);

const test=()=>{
  const p=Parser();
};
test();
