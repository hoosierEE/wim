/* main.js -- Wraps the browser.
   All I/O goes through here:
   - persistent state
   - keyboard/mouse input
   - drawing to screen
   - config file load/save */

const ctx=document.getElementById('c').getContext('2d');

/* render : canvas -> String -> IO() */
const render=(lines)=>{
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    let la=lines.split('\n'),pos=0;
    la.forEach(l=>{
        pos+=20;
        ctx.fillText(l,20,pos);
    });
};

/* update : AnyEvent -> Action */
const update=(perf_now)=>{
    WIMUI.handle_evt(IN);// step state machine
};


let IN={
    KC:new Set(),/* {KeyChord} */
    KS:[[],[],[],[]],/* [[Key],[Code],[Millis],[ModCode]] */
    KSLEN:10,
};

/* key_handler : KeyboardEvent -> u1 -> IO() */
const key_handler=(ev,is_keydown)=>{
        IN.KC[is_keydown?'add':'delete'](ev.code);
    if(is_keydown){/* update KC here so requestAnimationFrame always deals with the same facts */
        requestAnimationFrame(update);
        const rk={/* 'reduced' KeyboardEvents */
            key:ev.key,
            code:ev.code,
            timestamp:ev.timeStamp|0,
            /* Probably the trickiest math in the whole program right here:
               Rebase any combo of 4 modifier keys into a 4-bit integer. */
            mod:['altKey','ctrlKey','metaKey','shiftKey']
                .reduce((a,b,i,ar)=>a+(ev[b]|0)*2**(ar.length-1-i),0),
        };
        /* 1. Call preventDefault() on everything EXCEPT the chords listed below.
           ok_chords are: 1 non-mod key, plus 1 or more mod keys. */
        let ok_chords={
            'KeyI':[5,10],
            'KeyR':[2,4],
            /* whitelist more keyboard shortcuts here if you want */
        }[rk.code];
        ok_chords?ok_chords.every(m=>rk.mod!==m):true && ev.preventDefault();
        /* 2. KS[0] is most recent value.  Max KS.length is 10. */
        Object.keys(rk).forEach((x,i)=>{
                IN.KS[i].unshift(rk[x]);
                IN.KS[i]=IN.KS[i].slice(-IN.KSLEN);// limit sequence length
        });
    }
};
window.addEventListener('keydown',e=>key_handler(e,1));
window.addEventListener('keyup',e=>key_handler(e,0));

/* Window -- load, resize */
const pixel_ratio_fix=()=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [ctx.canvas.height,ctx.canvas.width]=[h,w].map(x=>dpr*x);
    [ctx.canvas.style.height,ctx.canvas.style.width]=[h,w].map(x=>x+'px');
    /* Set font size AFTER modifying canvas! */
    ctx.font='16px "Source Code Pro for Powerline"'; //ctx.font='16px monospace';
    ctx.scale(dpr,dpr);
};
window.addEventListener('load',()=>{
    pixel_ratio_fix();
    render('Hello\n   world!');
});
window.addEventListener('resize',pixel_ratio_fix);
