/* Core.js has 2 main responsibilities:
 1. accept messages from input devices TODO
 2. and send messages to output devices (supports canvas only)

 Could eventually interface between any/all plugins, including things
 like syntax highlighting, spell checking, indentation, etc. */
const Core=()=>{/* String (looks like an array of lines). */

  const pt={line:0, col:0}; /* Cursor position */

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
  const lines=(a,b)=>{const c=idx(a); return all_lines().slice(c,Math.max(c,c+b|0));};

  // TODO all of these
  const ins=(a,b)=>{};/* insert string (a) at position(s) (b) */
  const del=(a,b)=>{};/* delete #(a) chars at position(s) (b) */
  const save=(a)=>{};/* Send a save/commit request to Core/backend. */

  return ({lines, put});
};
