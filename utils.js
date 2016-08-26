/* Utils */

/* zip : [(x,y)] -> ([x],[y]) */
const zip=xs=>xs[0].map((_,y)=>xs.map(x=>x[y]));

/* curry : ((x,y) -> z) -> (x -> y -> z) */
const curry=(f,...x)=>f.length>x.length?(...y)=>curry(f,...x,...y):f(...x);

/* to2d : {k:{o}} -> [[o]]
   convert an object (with boxing level 2) to 2d array */
const to2d=o=>{
    let oa=[];
    for(let i in o){
        let ia=[];
        for(let ii in o[i]){ia.push(o[i][ii])}
        oa.push(ia);
    }
    return oa;
};
