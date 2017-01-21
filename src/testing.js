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
  let mc=m.toString(2); while(mc.length<4){mc='0'+mc;}
  [...mc].forEach((x,i)=>t[mods[i]]=!!Number(x));
  return t;
};

/* Control-g should reset */
const Control=mke('Control',2,'ControlLeft'), Control_g=mke('g',2);/* Ctrl-g should reset */
const reset=()=>{return cg=chord(Control,Control_g)[1];};
console.assert(reset().status=='quit','Ctrl+G should reset');

/* Long sequences of characters should be possible. */
const alphabet='abcdefghijklmnopqrstuvwxyz',
      mkes=[...alphabet].map(x=>mke(x,0));

const test=(str)=>{
  reset(); for(let i in str){
    if(peck(mke(str[i],0)).status!=='continue'){return false;}
  } return true;
};

const addone=(str='')=>{
  let r=[]; for(let i in alphabet){
    if(test(str+alphabet[i])){r.push(str+alphabet[i]);}
  } return r.length?r:str;
};

const flatten=(x)=>x.reduce((a,b)=>a.concat(Array.isArray(b)?flatten(b):b),[]);
const addall=(x)=>flatten(x.map(addone));
const longseq=(x,n)=>{while(n-->0){x=addall(x);} return x;};
console.assert(Math.max(...longseq([...alphabet],5).map(x=>x.length))>4,'long sequences (>4) should exist');
