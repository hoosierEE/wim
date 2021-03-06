const Functional=()=>{
  /* zip : [(x,y)] -> ([x],[y]) */
  const zip=xs=>xs[0].map((_,y)=>xs.map(x=>x[y]));

  /* curry : ((x,y) -> z) -> (x -> y -> z) */
  const curry=(f,...x)=>f.length>x.length?(...y)=>curry(f,...x,...y):f(...x);
  return ({curry,zip});
};

const Array=()=>{
  const intervals=(a,b)=>{
    if(a>0){let r=[]; for(let i=0;i<b.length;i+=a){r.push(b.slice(i,i+a));} return r;}
    if(a<0){
      let r=[], t=b.slice(), counter=0;
      while(t.length>-a){
        r.unshift(t.slice(a));
        t=t.slice(0,a);
      } if(t.length){r.unshift(t);} pp(r); return r;
    } return b; /* a===0 */
  };

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
    // return (x instanceof Array) ? x.map(roll0) : roll0(x);
    return (Array.isArray(x)) ? x.map(roll0) : roll0(x); /* NOTE untested version */
  };

  /* http://stackoverflow.com/a/12646864/2037637 Randomize x using Durstenfeld shuffle algorithm. */
  const deal=(x)=>x.reduce((_,__,i)=>{const j=roll(i+1), t=x[i]; x[i]=x[j]; x[j]=t; return x;});

  return ({copy,deal,intervals,iota,roll,reshape});
};

const Rx=()=>{
  const rxmatches=(a,b)=>{let r=[],m;while((m=a.exec(b))!==null){r.push(m.index);}return r;};
  return ({rxmatches});
};
