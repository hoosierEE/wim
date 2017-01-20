/* pretty print */
const pp=(y)=>console.log(JSON.stringify(y));

/* arrays */
const reshape=(x,y)=>{
  const reshape0=(x,y)=>{let r=[];while(y.length){r.push(y.splice(0,x));}return r;};
  while(x.length){y=reshape0(x.pop(),y);}
  return y[0];
};
const iota=(n)=>{/* NOTE: ascending only */
  const iota0=(y)=>{let r=[]; while(y>0){r.unshift(--y);} return r;},
        nprod=(x)=>x.reduce((a,b)=>a*b);
  return reshape(n,iota0(nprod(n)));
};
const copy=(x,y)=>{let r=[];while(y-->0)r.push(x);return r;};

/* ascii */
const ai=(x)=>x.codePointAt();

/* randomness */
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


/* TEST! */
const test=()=>{
  const p=Parser(),
        keydn=(e)=>p.key_handler(e,0),
        keyup=(e)=>p.key_handler(e,1),
        peck=(e)=>{const r=keydn(e);keyup(e); return r;},
        chord=(...e)=>{const r=e.map(x=>keydn(x));e.forEach(x=>keyup(x)); return r;};

  /* Mock KeyboardEvent */
  const mke=(k,m=0,c='',ts=performance.now())=>{
    if(!c && k>='a'&&k<='z' || k>='A'&&k<='Z'){c='Key'+k.toUpperCase();}
    const t={code:c, key:k, timeStamp:ts, preventDefault:function(){}},
          mods=['shiftKey','metaKey','ctrlKey','altKey'];
    let mc=m.toString(2);while(mc.length<4){mc='0'+mc;}
    [...mc].forEach((x,i)=>t[mods[i]]=!!Number(x));
    return t;
  };

  /* Control-g should reset */
  const Control=mke('Control',2,'ControlLeft'), Control_g=mke('g',2);/* Ctrl-g is a reset */
  const reset=()=>{return cg=chord(Control,Control_g)[1];};
  console.assert(reset().status=='quit','can reset');

  const alpha_lowercase=String.fromCharCode(...iota([26]).map(x=>x+(ai('a')))),
        mkes=[...alpha_lowercase].map(x=>mke(x,0));

  const f=(n)=>{
    return [...alpha_lowercase].map((x,i)=>{
      let r=peck(mkes[i]);
      if(n>0 && r.status=='continue'){reset();return x;}
      return 0;
    }).filter(x=>x);
  }; pp(f(5));

  /* TODO -- Depth-first search all sequences of keyboard events.

   f():
      for letter in letters.map(peck):
        if 'continue':
          return letter+f()
        return letter

   a (error) -> a
   b (done) -> b
   c (continue) -> c + f()
   ca (error)
   cb (done)
   cc (done)
   cd (error)
   ce (done)
   cf (continue)
   cfa (done)
   ...
   cfz (done)
   cg (error)
   ce (done)
   cf (continue)
   cfa (done)
   ...
   cfz (done)
   cg (error)
   ...
   cz (error)
   d (continue)
   ...
   */
};
test();
