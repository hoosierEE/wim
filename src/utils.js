/* Utils */
'use strict';

/* zip : [(x,y)] -> ([x],[y]) */
const zip=xs=>xs[0].map((_,y)=>xs.map(x=>x[y]));

/* curry : ((x,y) -> z) -> (x -> y -> z) */
const curry=(f,...x)=>f.length>x.length?(...y)=>curry(f,...x,...y):f(...x);


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

const copy=(x,y)=>{let r=[];while(x-->0)r.push(y);return r;};

/* randomness */
const roll=(x)=>{
  const roll0=(y)=>Math.random()*y|0;
  return (x instanceof Array) ? x.map(roll0) : roll0(x);
};

/* http://stackoverflow.com/a/12646864/2037637 Randomize x using Durstenfeld shuffle algorithm. */
const deal=(x)=>{
  return x.reduce((_,__,i)=>{
    const j=roll(i+1), t=x[i]; x[i]=x[j]; x[j]=t; return x;
  });
};
