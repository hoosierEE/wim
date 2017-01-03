/* main.js -- Entry point; wraps the browser.*/
const ctx=document.getElementById('c').getContext('2d');
const wui=WIMUI();
const update=(ms)=>{wui.update(IN);};

const IN={
    KC:new Set(),/* {KeyChord} */
    KS:[[],[],[],[]],/* [[Key],[Code],[Millis],[ModCode]] */
    KS_MAXLEN:10
};

/* key_handler : KeyboardEvent -> u1 -> IO() */
const key_handler=(ev,is_keydown)=>{
        IN.KC[is_keydown?'add':'delete'](ev.code);
    if(is_keydown){
        const rk=[ev.key, ev.code, ev.timeStamp|0,
                  ['altKey','ctrlKey','metaKey','shiftKey']
                  .reduce((a,b,i)=>a|((ev[b]|0)<<i),0)],
              /* ev.preventDefault() if none of these chords match. */
              pd={'KeyI':[5,10], /* Ctrl-I or Cmd-Opt-i */
                  'KeyR':[2,4]   /* Ctrl-r or Cmd-r */
                 }[rk[1]];pd?pd.every(m=>rk[3]!==m):true&&ev.preventDefault();
        rk.forEach((_,i)=>{IN.KS[i].unshift(rk[i]); IN.KS[i]=IN.KS[i].slice(0,IN.KS_MAXLEN);});
        requestAnimationFrame((ms)=>{wui.update(IN);});
    }
};
window.addEventListener('keydown',(e)=>key_handler(e,1));
window.addEventListener('keyup',(e)=>key_handler(e,0));

/* Render to canvas */
const pixel_ratio_fix=(s)=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    ctx.scale(dpr,dpr);
    [ctx.canvas.height,ctx.canvas.width]=[h,w].map(x=>dpr*x);
    [ctx.canvas.style.height,ctx.canvas.style.width]=[h,w].map(x=>x+'px');
    // fonts AFTER canvas mod
    ctx.font=(18*dpr)+'px "Source Code Pro for Powerline"';
};

/* render : String -> IO() TODO change to (render : Model -> IO()) */
const render=(lines)=>{
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    let pos=20; lines.replace(/\. +/g,'.\n').split('\n').forEach(l=>{ctx.fillText(l,20,pos+=30);});
};

let str="This is Ginger. She is a linx and has a glowing blue mane that she shakes to get warm. She likes to make fire sparks out of her tail. Her favorite thing to eat is peppers so she can make her sparks. Ginger lives with her linx family. She has friends that are birds. They live together in the forest. The trees are magical so they don't get burned down. She likes living in the forest. ";
const winevts=()=>{pixel_ratio_fix(str); render(str);};
window.addEventListener('load',winevts);
window.addEventListener('resize',winevts);

