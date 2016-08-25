/* wim -- modal text editor */
'use strict';

/* Testing -- write a string to the canvas */
const do_render=c=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    const lines=[
        'TODO keyboard input',
        '- inputs accumulate until they can be recognized as \'operations\', then are pushed to history stack',
        '- \'insert mode\' inputs aren\'t saved.'
    ].join('\n');
    c.fillText(lines,20,30);
};

/* Parsing commands */

/* parse : DaKeys -> Action */
const parse=o=>{};

/* Events -- keyboard and mouse */

/* key_filter : KeyboardEvent:o -> RawKey:o */
const key_filter=key_event=>({
    key:key_event.key,
    code:key_event.code,
    timestamp:key_event.timeStamp|0,
    type:key_event.type==='keydown'|0,
    modifier:['altKey','ctrlKey','metaKey','shiftKey']
        .map(y=>key_event[y]|0).reduce((x,y,i,arr)=>x+y*Math.pow(2,arr.length-1-i),0) /* 0-15 */
});


const DaKeys={};
const key_handler=x=>{
    const kf=key_filter(x),
          preventable=ke=>{
              let let_through={
                  'KeyI':[2,4,10],
                  'KeyR':[2,4],
              }[ke.code];
              return let_through?let_through.every(x=>ke.modifier!==x):true;
          };
    DaKeys[kf.code]=kf;
    if(x.type==='keydown'){
        if(preventable(kf)){x.preventDefault()}
        console.table(DaKeys);
    }
};
window.addEventListener('keydown',key_handler);
window.addEventListener('keyup',key_handler);

/* Window -- load, resize */
const pix_ratio_fix=c=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    c.canvas.height=c.canvas.height;
    [c.canvas.height,c.canvas.width]=[h,w].map(x=>dpr*x);
    [c.canvas.style.height,c.canvas.style.width]=[h,w].map(x=>x+'px');
    c.font='16px monospace';/* has to be set after modifying c.canvas.anything */
    c.scale(dpr,dpr);
};
const ctx=document.getElementById('c').getContext('2d');
window.addEventListener('resize',()=>pix_ratio_fix(ctx));
window.addEventListener('load',()=>{
    pix_ratio_fix(ctx);
    do_render(ctx); // testing
});
