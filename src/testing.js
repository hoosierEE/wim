/* TEST! */
const p=Parser(),
      keydn=(a)=>p.key_handler(a,0),
      keyup=(a)=>p.key_handler(a,1),
      peck=(a)=>{const r=keydn(a);keyup(a); return r;},
      chord=(...a)=>{const r=a.map(x=>keydn(x));a.forEach(x=>keyup(x)); return r;};

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
  reset(); for(let s of str){
    if(peck(mke(s,0)).status!=='continue'){return false;}
  } return true;
};

const addone=(str='')=>{
  let r=[]; for(let a of alphabet){
    if(test(str+a)){r.push(str+a);}
  } return r.length?r:str;
};

const flatten=(x)=>x.reduce((a,b)=>a.concat(Array.isArray(b)?flatten(b):b),[]);
const addall=(x)=>flatten(x.map(addone));
const longseq=(x,n)=>{while(n-->0){x=addall(x);} return x;};
const seqs=longseq([...alphabet],5);
console.assert(Math.max(...seqs.map(x=>x.length))>4,'long sequences (>4) should exist');
