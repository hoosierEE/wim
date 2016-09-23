/* wim -- modal text editor */
/* Testing -- write a string to the canvas */
const read_one=(e,context)=>{
    if(!e.target.files[0]){console.log('no file found');return;}
    let r=new FileReader();
    r.onload=(e)=>render(context,e.target.result);
    r.readAsText(e.target.files[0]);
};
document.getElementById('file-input').addEventListener('change',(e)=>read_one(e,ctx),false);

/* render : context -> String -> ()*/
const render=(c,lines)=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    let la=lines.split('\n'),pos=0;
    la.map(l=>{
        pos+=20;
        c.fillText(l,20,pos);
    });
};

/* update : AnyEvent -> Action */
const update=(perf_now)=>{
    WIMUI.handle_evt(IN);// step state machine
};


/* Model -- inputs */
let IN={KC:new Set(),/* {Chord} */ KS:[[],[],[],[]],/* [Key] */};
const MAX_KS_LENGTH=10;

/* Keyboard */
const key_handler=(kev,down,updatefn)=>{
    const rk={/* 'reduced' KeyboardEvents */
        key:kev.key,
        code:kev.code,
        timestamp:kev.timeStamp|0,
        /* Probably the most complex math in the whole program right here: */
        mod:['altKey','ctrlKey','metaKey','shiftKey']
            .reduce((a,b,i,arr)=>a+(kev[b]|0)*2**(arr.length-1-i),0)/* [u1,u1,u1,u1] -> u4 */
    };

    /* update KC here so requestAnimationFrame always deals with the same facts */
    IN.KC[down?'add':'delete'](rk.code);
    if(down){
        /* 1. Call preventDefault() on everything EXCEPT the chords listed below.
           ok_chords are: 1 non-mod key, plus 1 or more mod keys. */
        let ok_chords={
            'KeyI':[5,10],
            'KeyR':[2,4],
            /* whitelist more keyboard shortcuts here if you want */
        }[rk.code];
        ok_chords?ok_chords.every(m=>rk.mod!==m):true && kev.preventDefault();

        /* 2. KS[0] is most recent value.  Max KS.length is 10. */
        Object.keys(rk).forEach((x,i)=>{
            IN.KS[i].unshift(rk[x]);
            IN.KS[i]=IN.KS[i].slice(-MAX_KS_LENGTH);// limit sequence length
        });
        requestAnimationFrame(updatefn);
    }
};
window.addEventListener('keydown',kbd_event=>key_handler(kbd_event,1,update));
window.addEventListener('keyup',kbd_event=>key_handler(kbd_event,0,update));
/* Events -- mouse */
//window.addEventListener('wheel',w=>console.log(w));


/* Window -- load, resize */
const pixel_ratio_fix=(c,cc)=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [cc.height,cc.width]=[h,w].map(x=>dpr*x);
    [cc.style.height,cc.style.width]=[h,w].map(x=>x+'px');
    /* Set font size AFTER modifying canvas! */
    //c.font='16px monospace';
    c.font='16px "Source Code Pro for Powerline"';
    c.scale(dpr,dpr);
};
const ctx=document.getElementById('c').getContext('2d');
window.addEventListener('resize',()=>{
    pixel_ratio_fix(ctx,ctx.canvas);
});
window.addEventListener('load',()=>{
    pixel_ratio_fix(ctx,ctx.canvas);
    render(ctx,'test\ning');// testing
});
