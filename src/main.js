/* wim -- modal text editor */
/* Testing -- write a string to the canvas */
const read_one=(e)=>{
    console.log(e);
    let file=e.target.files[0];
    if(!file)return;
    let reader=new FileReader();
    reader.onload=(e)=>{
        let contents=e.target.result;
        //displayContents(contents);
        render(ctx,contents);
    };
    reader.readAsText(file);
};
document.getElementById('file-input').addEventListener('change',read_one,false);

const render=(c,lines)=>{
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    let la=lines.split('\n'),pos=0;
    la.forEach(l=>{
        pos+=20;
        c.fillText(l,20,pos);
    });
};

/* update : AnyEvent -> Action */
const update=(perf_now,input)=>{
    /* what kind of keyboard input did we just get? */
    const get_token=(tok)=>TOKENS.filter(x=>x.indexOf(tok)>-1).map(x=>[x[0],tok]);
    console.log(JSON.stringify(get_token(input.KS[0].slice(-1)[0]),null,4));
    //console.log(Array.from(input.KC));// chords

    // TODO: command FSM
};

const proc_state=(current,next_states)=>{
    if(current in next_states){/* not a 'wildcard' */
        switch(current){
        case'clipboard':
        case'motion':
        case'text_object':
        case'verb_verb':
            next_states=[];
            break;
        case'insert':
        case'search_char':
            next_states=['ascii'];
            break;
        case'mult0':
            next_states=STATES.filter(x=>x!='mult0');
            break;
        case'multN':
            next_states=STATES.filter(x=>x!='mult0');
            break;
        case'verb':
            next_states=['mult0','modifier'];
            break;
        case'modifier':
            next_states=['mult0','text_object','motion'];
            break;
        }
    }
    else{
        state.current='init';
        next_states=[];
    }
};

/* Model -- command language */
const TOKENS={
    mult0:{
        matches:[...'123456789'],
    },
    multN:{
        matches:[...'0123456789'],
    },
    verb:{
        matches:[...'cdy'],
    },
    text_object:{
        matches:[...'0^${}()[]<>`"\'bBeEwWG'],
    },
    motion:{
        matches:[...'hjkl'],
    },
    search_char:{
        matches:[...'fFtT'],
    },
    edit:{
        matches:[...'pPr'],
    },
};
const STATES=Object.keys(TOKENS);

/* Model -- inputs */
const IN={
    KC:new Set(),/* Key Chord */
    KS:[[],[],[],[]],/* Key Sequence */
};

/* Events -- keyboard and mouse */
const key_handler=(x,down,input,updatefn)=>{
    const rk={/* 'reduced' KeyboardEvents */
        key:x.key,
        code:x.code,
        timestamp:x.timeStamp|0,
        mod:['altKey','ctrlKey','metaKey','shiftKey']
            .reduce((a,b,i,arr)=>a+(x[b]|0)*2**(arr.length-1-i),0)/* rebase 4 bits -> Int */
    };
    /* update KC here so requestAnimationFrame always deals with the same facts */
    input.KC[down?'add':'delete'](rk.code);
    if(down){
        /* 1. Call preventDefault() on everything EXCEPT the chords listed below.
           ok_chords are: 1 non-mod key, plus 1 or more mod keys. */
        let ok_chords={
            'KeyI':[5,10],
            'KeyR':[2,4],
            /* whitelist more keyboard shortcuts here if you want */
        }[rk.code];
        ok_chords?ok_chords.every(m=>rk.mod!==m):true && x.preventDefault();
        /* 2. Push each field to their respective fields in KS array. */
        Object.keys(rk).forEach((x,i)=>{
            input.KS[i].push(rk[x]);
            input.KS[i]=input.KS[i].slice(-10);
        });
        requestAnimationFrame(t=>updatefn(t,IN));
    }
};
window.addEventListener('keydown',event=>key_handler(event,1,IN,update));
window.addEventListener('keyup',event=>key_handler(event,0,IN,update));

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
const canvas=document.getElementById('c'), ctx=canvas.getContext('2d');
window.addEventListener('resize',()=>pixel_ratio_fix(ctx,canvas));
window.addEventListener('load',()=>{
    pixel_ratio_fix(ctx,canvas);
    render(ctx,'test\ning');// testing
});
window.addEventListener('wheel',w=>console.log(w));
