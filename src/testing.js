/* pretty print */
const pp=(y)=>console.log(JSON.stringify(y));

/* TEST! */
const p=Parser(),
      keydn=(e)=>p.key_handler(e,0),
      keyup=(e)=>p.key_handler(e,1),
      peck=(e)=>{const r=keydn(e);keyup(e); return r;},
      chord=(...e)=>{const r=e.map(x=>keydn(x));e.forEach(x=>keyup(x)); return r;};

/* Mock KeyboardEvent */
const mke=(k,m=0,c='',ts=performance.now())=>{
  if(!c && k>='a'&&k<='z' || k>='A'&&k<='Z'){c='Key'+k.toUpperCase();}
  const t={code:c, key:k, timeStamp:ts, preventDefault:function(){}},
        mods=['shiftKey','metaKey','ctrlKey','altKey'];
  let mc=m.toString(2);while(mc.length<4){mc='0'+mc;}
  [...mc].forEach((x,i)=>t[mods[i]]=!!Number(x));
  return t;
};

/* Control-g should reset */
const Control=mke('Control',2,'ControlLeft'), Control_g=mke('g',2);/* Ctrl-g is a reset */
const reset=()=>{return cg=chord(Control,Control_g)[1];};
console.assert(reset().status=='quit','can reset');

const alphabet='abcdefghijklmnopqrstuvwxyz',
      mkes=[...alphabet].map(x=>mke(x,0));

const chk=(str)=>{
  let r=0;
  return [...str].map(x=>mke(x,0)).map(x=>{
    reset();
    return x.key+(peck(x).status==='continue'?'_':'');
  });
};

/* TODO -- find all sequences of keyboard events.

 a (error) -> a
 b (done) -> b
 c (continue) -> c + f()
 ca (error)
 cb (done)
 cc (done)
 cd (error)
 ce (done)
 cf (continue)
 cfa (done)
 ...

 cfz (done)
 cg (error)
 ce (done)
 cf (continue)
 cfa (done)
 ...

 cfz (done)
 cg (error)
 ...

 cz (error)
 d (continue)
 ...

 */
