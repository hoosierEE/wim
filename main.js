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

/* key_transform : KeyboardEvent:o -> (UnicodeKey:s, MillisecondTimestamp:i, IsKeyDown:u1, ModifierCode:u4)
   key_transform : key_event -> RawKey */
const key_transform=key_event=>({
    key:key_event.key,
    code:key_event.code,
    timestamp:key_event.timeStamp|0,
    type:key_event.type=='keydown'|0,
    modifier:['altKey','ctrlKey','metaKey','shiftKey']
        .map(y=>key_event[y]|0)
        .reduce((x,y,i,arr)=>x+y*Math.pow(2,arr.length-1-i),0) /* 0-15 */
});

window.addEventListener('keydown',x=>{
    const kt=key_transform(x);
    DownKeys[kt.code]=true;
    if(!((kt.key=='I'&&kt.modifier==5)||(kt.modifier==10&&kt.code=='KeyI'))){x.preventDefault()}
    RawKeys.push(kt);
    console.table(RawKeys.filter(x=>x.type).slice(-4));
});
window.addEventListener('keyup',x=>{
    const kt=key_transform(x);
    DownKeys[kt.code]=false;
    RawKeys.push(kt);
});

let RawKeys=[],DownKeys={};
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
