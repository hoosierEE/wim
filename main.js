/* wim -- modal text editor
   Haskell-inspired type signatures/comments
   Rust-inspired type names:  (uN: unsigned N-bit int), (s: string), (f: float)
 */
'use strict';
/* Utils */
/* zip : [(x,y)] -> ([x],[y]) */
const zip=xs=>xs[0].map((_,y)=>xs.map(x=>x[y]));
/* curry : ((x,y) -> z) -> (x -> y -> z) */
const curry=(f,...x)=>f.length>x.length?(...y)=>curry(f,...x,...y):f(...x);


const testwrite=c=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    c.font='16px monospace';
    const lines=[
        'TODO keyboard input',
        '- inputs accumulate until they can be recognized as \'operations\', then are pushed to history stack',
        '- \'insert mode\' inputs aren\'t saved.'
    ];
    c.fillText(lines.reduce((x,y)=>x+y+'\n',''),20,30);
};

/* TODO keyboard input
   - inputs accumulate until they can be recognized as 'operations', then are pushed to history stack
   - 'insert mode' inputs aren't saved */
/* key_transform : KeyboardEvent -> [UnicodeKey, MillisecondTimestamp, IsKeyDown, ModifierCode]
   key_transform : o -> [s, u64, u1, u4] */
const key_transform=key_event=>[
    key_event.key,
    key_event.timeStamp|0,
    key_event.type=='keydown'|0,
    ['altKey','ctrlKey','metaKey','shiftKey']
        .map(y=>key_event[y]|0)
        .reduce((x,y,i,arr)=>x+y*Math.pow(2,arr.length-1-i),0),
];
/* check_keys : [s, u64, u1, u4] -> u1 */
const check_keys=keys=>{
};

let Keys=[];
window.addEventListener('keydown',x=>Keys.push(key_transform(x)));
window.addEventListener('keyup',x=>Keys.push(key_transform(x)));

const DEBUG=1;
const resize_handler=c=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [c.canvas.height,c.canvas.width]=[h,w].map(x=>(dpr?dpr:1)*x);
    [c.canvas.style.height,c.canvas.style.width]=[h,w].map(x=>x+'px');
    c.scale(dpr,dpr);
    if(DEBUG){
        //console.log(`DEBUG: ${DEBUG}`);
        testwrite(c);
    }
};
const ctx=document.getElementById('c').getContext('2d');
window.addEventListener('resize',()=>resize_handler(ctx));
window.addEventListener('DOMContentLoaded',()=>resize_handler(ctx));
