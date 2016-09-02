/* wim -- modal text editor */
'use strict';
/* Testing -- write a string to the canvas */
const render=c=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    const lines=[
        'TODO keyboard input',
        '- inputs accumulate until they can be recognized as \'operations\', then are pushed to history stack',
        '- \'insert mode\' inputs aren\'t saved.'
    ].join('\n');
    c.fillText(lines,20,30);
};

/* invert : DaKeys -> InvertedKeys
   Object-of-Objects into 2d array where rows are instances and columns are fields */
const invert=o=>{
    let oa=Object.keys(o).reduce((x,y)=>{x.push(o[y]);return x;},[]);
    return Object.keys(oa[0]).map(w=>oa.reduce((x,y)=>{x.push(y[w]);return x;},[w]));
};

/* sort_by : String -> InvertedKeys -> SortedInvertedKeys
   1. invert DaKeys
   2. get column index from string
   3. strip column name and sort by column number
   4. restore column names */
const sort_by=(str,ik)=>{
    let d=zip(ik), key=d[0].indexOf(str);
    return [d[0]].concat(d.slice(1).sort((x,y)=>(x[key]>y[key])?1:(x[key]<y[key])?-1:0));
};

/* combo : String -> SortedInvertedKeys -> MilliSeconds -> Bool
   str is suffix of FlatSortedKeys with less than timeout ms between each of str? */
const combo=(str,sik,timeout=Infinity)=>{
    let suffix=zip(sik.slice(-(str.length)));
    if(suffix[0].join('')===str){
        let idx=sik[0].indexOf('timestamp'),
            ss=suffix[idx];
    }
    return false;
};

/* update : AnyEvent -> Action */
const update=perf_timestamp=>{
    /* what kind of keyboard input did we just get? */
    let ks=invert(DaKeys);
    const keystrokes=sort_by('timestamp',ks);
    (combo('fds',keystrokes,500));
};

/* Events -- keyboard and mouse */
const DaKeys={};/* customized KeyboardEvents */
const key_handler=x=>{
    const kf={/* KeyboardEvents, filtered */
        key:x.key,
        code:x.code,
        timestamp:x.timeStamp|0,
        type:x.type==='keydown'|0,
        mod:['altKey','ctrlKey','metaKey','shiftKey']
            .map(y=>x[y]|0)
            .reduce((a,b,i,arr)=>a+b*Math.pow(2,arr.length-1-i),0)
    };
    DaKeys[kf.code]=kf;
    if(kf.type){
        let ok_default={
            'KeyI':[5,10],/* [Cmd Opt i] [Ctrl i] */
            'KeyR':[2,4],/* [Cmd r] [Ctrl r] */
            /* optionally whitelist more keyboard shortcuts here */
        }[kf.code];
        /* call preventDefault() on everything EXCEPT the chords listed above. */
        ok_default?ok_default.every(m=>kf.mod!==m):true && x.preventDefault();
        requestAnimationFrame(update);
    }
};
window.addEventListener('keydown',key_handler);
window.addEventListener('keyup',key_handler);

/* Window -- load, resize */
const pixel_ratio_fix=(c,cc)=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [cc.height,cc.width]=[h,w].map(x=>dpr*x);
    [cc.style.height,cc.style.width]=[h,w].map(x=>x+'px');
    //c.font='16px monospace';/* Must set AFTER modifying canvas! */
    c.font='16px "Source Code Pro for Powerline"';/* Must set AFTER modifying canvas! */
    c.scale(dpr,dpr);
};
const canvas=document.getElementById('c'), ctx=canvas.getContext('2d');
window.addEventListener('resize',()=>pixel_ratio_fix(ctx,canvas));
window.addEventListener('load',()=>{
    pixel_ratio_fix(ctx,canvas);
    render(ctx);// testing
});
