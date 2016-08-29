/* Utils */

/* zip : [(x,y)] -> ([x],[y]) */
const zip=xs=>xs[0].map((_,y)=>xs.map(x=>x[y]));

/* curry : ((x,y) -> z) -> (x -> y -> z) */
const curry=(f,...x)=>f.length>x.length?(...y)=>curry(f,...x,...y):f(...x);

/* to2d : {k:{vs}} -> [[vs]]
   object -> 2d array with 'column' names
*/
const to2d=o=>{
    //if(!Object.keys(o).length){return [[null]]}
    let oa=[Object.keys(o[Object.keys(o)[0]])];
    for(let i in o){let ia=[]; for(let j in o[i]){ia.push(o[i][j])} oa.push(ia);}
    return oa;
};

/* sort_by : 'key' -> DaKeys -> [RawKey]
   DaKeys sorted by 'key'
*/
const sort_by=(str,dk)=>{
    let d=to2d(dk), key=d[0].indexOf(str);
    return d.slice(1).sort((x,y)=>(x[key]>y[key])?1:(x[key]<y[key])?-1:0);
};

/* combo : 'str' -> DaKeys -> ms -> Bool
   Returns true if DaKeys contains the keystrokes 'str'.
   A positive delta means the keystrokes can't have more than `ms` milliseconds between them.
*/
const combo=(str,dk,delta=null)=>{
    console.log(delta);
};
