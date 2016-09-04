/* Utils */
'use strict';

/* zip : [(x,y)] -> ([x],[y]) */
const zip=xs=>xs[0].map((_,y)=>xs.map(x=>x[y]));

/* curry : ((x,y) -> z) -> (x -> y -> z) */
const curry=(f,...x)=>f.length>x.length?(...y)=>curry(f,...x,...y):f(...x);
