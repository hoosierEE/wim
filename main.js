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


/* flatten : {k1:{v1,v2,vN},k2:{v1,v2,vN}} -> [[v1],[v2],[vN]]
   object -> 2d array with 'column' names */
const flatten=o=>{
    let oo=Object.keys(o);
    if(oo.length<1){return null;}
    let oa=[Object.keys(o[oo[0]])];/* headers */
    for(let i in o){let ia=[]; for(let j in o[i]){ia.push(o[i][j]);} oa.push(ia);}
    return oa;
};

const flat2=o=>{
    let oa=Object.keys(o).reduce((x,y)=>{x.push(o[y]);return x;},[]),
        ok=Object.keys(oa[0]);
    let ii=ok.reduce((x,y,i,a)=>{

    },[[ok]]);
    return ii;
};
/* sort_by : 'key' -> DaKeys -> [RawKey]
   DaKeys sorted by 'key' */
const sort_by=(str,dk)=>{
    let d=flatten(dk), key=d[0].indexOf(str);
    return d.slice(1).sort((x,y)=>(x[key]>y[key])?1:(x[key]<y[key])?-1:0);
};

/* combo : 'str' -> DaKeys -> ms -> Bool
   Returns true if DaKeys contains the keystrokes 'str'.
   A positive delta means the keystrokes can't have more than `ms` milliseconds between them. */
const combo=(str,dk,delta=null)=>{
    console.log(delta);
};

/* update : AnyEvent -> Action */
const update=perf_timestamp=>{
    /* what kind of keyboard input did we get? */
    const keystrokes=sort_by('timestamp',DaKeys);
    console.table(keystrokes);
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
    DaKeys[x.code]=kf;
    if(kf.type==='keydown'){
        let allow_default={
            'KeyI':[5,10],
            'KeyR':[2,4],
        }[kf.code];
        /* call preventDefault() on everything EXCEPT the chords listed above. */
        allow_default?allow_default.every(m=>kf.mod!==m):true && x.preventDefault();
    }
    requestAnimationFrame(update);
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
