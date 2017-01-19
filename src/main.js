const ctx=document.getElementById('c').getContext('2d'), par=Parser(1);

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
  ctx.font=(18*dpr)+'px "Source Code Pro for Powerline"';
  render();
};
const key_handler_dn=(e)=>par.key_handler(e,0),
      key_handler_up=(e)=>par.key_handler(e,1);
window.addEventListener('keydown',key_handler_dn);
window.addEventListener('keyup',key_handler_up);
window.addEventListener('load',rsz);
window.addEventListener('resize',rsz);


/* UTILS */
const log=(y)=>console.log(JSON.stringify(y));

/* array */
const iota=(y)=>{let r=[];while(y>0){r.unshift(--y);}return r;};
const copy=(x,y)=>{let r=[];while(y-->0)r.push(x);return r;};
const ai=(x)=>x.codePointAt();

/* random */
const roll=(y)=>Math.random()*y|0;
/* http://stackoverflow.com/a/12646864/2037637
 Randomize array in-place using Durstenfeld shuffle algorithm. */
const shuffle=(array)=>{
  for(let i=array.length-1;i>0;--i) {
    const j=Math.floor(Math.random()*(i+1)), temp=array[i];
    array[i]=array[j];
    array[j]=temp;
  } return array;
};

/* testing */
const test=(()=>{
  const p=Parser(),
        mke=(k,m=0,c='',ts=performance.now())=>{/* Mock KeyboardEvent */
          if((k>='a'&&k<='z')||(k>='A'&&k<='Z')){c='Key'+k.toUpperCase();}
          const t={code:c, key:k, timeStamp:ts, preventDefault:function(){}},
                mods=['shiftKey','metaKey','ctrlKey','altKey'];
          let mc=m.toString(2);while(mc.length<4){mc='0'+mc;}
          [...mc].map((x,i)=>(t[mods[i]]=!!Number(x)));
          return t;
        },
        Cg=mke('c',2);/* Ctrl-g is a reset */
  console.log(p.key_handler(Cg));
  console.assert(p.key_handler(Cg).status=='quit','can reset');

  const lower=String.fromCharCode(...iota(26).map(x=>x+(ai('a'))));
  const mkes=[...lower].map(x=>mke(x,0));

  /* construct a bunch of keyboard events */
  const dfs=(d=4)=>{
  };
  return dfs();
})();
