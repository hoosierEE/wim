/* Core.js has 2 main responsibilities:
 1. accept messages from input devices TODO
 2. and send messages to output devices (supports canvas only)

 But eventually it should be the interface which arbitrates messages among ALL plugins,
 including things like syntax highlighting, spell checking, indentation, etc. */
const Core=()=>{/* String (looks like an array of lines). */
  const my={str:'', starts:[], lines:[]};

  const all_lines=()=>my.str.match(/^.*/mg);
  const put=(a)=>{my.str=a;};

  const idx=(a)=>{/* number -> valid index into [lines] */
    a|=0; l=all_lines().length;
    if(0<=a && a<l){return a;}
    if(a>=l){return l-1;}
    return Math.max(0,a+l);
  };

  /* (a+i.b) { cutLF lines */
  const get_lines=(a,b)=>{a=idx(a), b=b+a; return all_lines().slice(a,b);};

  // TODO all of these
  const ins=(a,b)=>{};/* insert string (a) at position(s) (b) */
  const del=(a,b)=>{};/* delete #(a) chars at position(s) (b) */
  const save=(a)=>{};/* Send a save/commit request to Core/backend. */

  return ({
    all_lines,
    get_lines,
    idx,
    put
  });
};
