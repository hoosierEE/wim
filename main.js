/* wim -- modal text editor
*/
'use strict';

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

/* RawKey : (s, u64, u1, u4)
   key_transform : KeyboardEvent -> [UnicodeKey, MillisecondTimestamp, IsKeyDown, ModifierCode]
   key_transform : o -> RawKey
*/
const key_transform=key_event=>[
    key_event.key,
    key_event.timeStamp|0,
    key_event.type=='keydown'|0,
    ['altKey','ctrlKey','metaKey','shiftKey']
        .map(y=>key_event[y]|0)
        .reduce((x,y,i,arr)=>x+y*Math.pow(2,arr.length-1-i),0) /* 0-15 */
];

/* pressed_keys : [RawKey] -> [RawKey] */
const pressed_keys=keys=>keys.filter(x=>x[2]);

let RawKeys=[],DownKeys={};
window.addEventListener('keydown',x=>{
    const kt=key_transform(x);
    DownKeys[x.key]=true;
    if(!(kt[0]=='I'&&kt[3]==5||kt[3]==10)){x.preventDefault()}
    RawKeys.push(kt);
    console.table(pressed_keys(RawKeys).slice(-4));
});
window.addEventListener('keyup',x=>{
    DownKeys[x.key]=false;
    RawKeys.push(key_transform(x));
});

const resize_handler=c=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [c.canvas.height,c.canvas.width]=[h,w].map(x=>dpr*x);
    [c.canvas.style.height,c.canvas.style.width]=[h,w].map(x=>x+'px');
    c.scale(dpr,dpr);
    testwrite(c); // DEBUG
};
const ctx=document.getElementById('c').getContext('2d');
window.addEventListener('resize',()=>resize_handler(ctx));
window.addEventListener('DOMContentLoaded',()=>resize_handler(ctx));
