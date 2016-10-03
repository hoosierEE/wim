/* main.js -- Wraps the browser.
   All I/O goes through here:
   - persistent state
   - keyboard/mouse input
   - drawing to screen
   - config file load/save */
const ctx=document.getElementById('c').getContext('2d');

/* render : String -> IO()
   ...although it should actually be
   render : Model -> IO() */
const render=(lines)=>{
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    let la=lines.split('\n'),pos=0;
    la.forEach(l=>{pos+=20; ctx.fillText(l,20,pos);});
};

/* update : AnyEvent -> Action */
/* update : Model -> Model */
const update=(performance_now)=>{
    WIMUI.handle_evt(IN);
};


let IN={
    KC:new Set(),/* {KeyChord} */
    KS:[[],[],[],[]],/* [[Key],[Code],[Millis],[ModCode]] */
    KS_MAXLEN:10,
};

/* key_handler : KeyboardEvent -> u1 -> IO() */
// const key_handler=(ev,is_keydown)=>{
//         IN.KC[is_keydown?'add':'delete'](ev.code);
//     if(is_keydown){/* update KC here so requestAnimationFrame always deals with the same facts */
//         const rk={/* 'reduced' KeyboardEvents */
//             key:ev.key,
//             code:ev.code,
//             timestamp:ev.timeStamp|0,
//             mod:['altKey','ctrlKey','metaKey','shiftKey']
//                 .reduce((a,b,i,ar)=>a+(ev[b]|0)*2**(ar.length-1-i),0),/* [String:4] to [u1:4] to u4 */
//         };
//         /* 1. Call preventDefault() on everything EXCEPT the chords listed below.
//            ok_chords are: 1 non-mod key, plus 1 or more mod keys. */
//         let ok_chords={
//             'KeyI':[5,10],
//             'KeyR':[2,4],
//             /* whitelist more keyboard shortcuts here if you want */
//         }[rk.code];
//         ok_chords?ok_chords.every(m=>rk.mod!==m):true && ev.preventDefault();
//         /* 2. KS[0] is newest.  Max KS length is 10. */
//         Object.keys(rk).forEach((x,i)=>{IN.KS[i].unshift(rk[x]); IN.KS[i]=IN.KS[i].slice(-IN.KS_MAXLEN);});
//         requestAnimationFrame(update);
//     }
// };

/* key_handler : KeyboardEvent -> u1 -> IO() */
const key_handler=(ev,is_keydown)=>{
        IN.KC[is_keydown?'add':'delete'](ev.code);
    if(is_keydown){/* update KC here so requestAnimationFrame always deals with the same facts */
        const rk=[/* 'reduced' KeyboardEvents */
            ev.key,
            ev.code,
            ev.timeStamp|0,
            ['altKey','ctrlKey','metaKey','shiftKey']
                .reduce((a,b,i,ar)=>a+(ev[b]|0)*2**(ar.length-1-i),0),
        ];
        /* 1. Call preventDefault() on everything EXCEPT the chords listed below.
           ok_chords are: 1 non-mod key, plus 1 or more mod keys. */
        let ok_chords={
            'KeyI':[5,10],
            'KeyR':[2,4],
            /* whitelist more keyboard shortcuts here if you want */
        }[rk[1]];
        ok_chords?ok_chords.every(m=>rk[3]!==m):true && ev.preventDefault();
        /* 2. KS[0] is newest.  Max KS length is 10. */
        rk.forEach((x,i)=>{IN.KS[i].unshift(rk[x]); IN.KS[i]=IN.KS[i].slice(-IN.KS_MAXLEN);});
        requestAnimationFrame(update);
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
window.addEventListener('load',()=>{pixel_ratio_fix(); render('Hello\n   world!');});
window.addEventListener('resize',pixel_ratio_fix);
