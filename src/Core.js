/* Core.js has 2 main responsibilities:
 1. accept messages from input devices TODO
 2. and send messages to output devices (supports canvas only)

 Could eventually interface between any/all plugins, including things
 like syntax highlighting, spell checking, indentation, etc. */
const Core=()=>{/* String (looks like an array of lines). */
  const my={str:'', starts:[], lines:[]};/* Document (string) */
  const pt={line:0, col:0, maxcol:0};/* Cursor position */

  /* Document-related. */
  const all_lines=()=>my.str.match(/^.*/mg);
  /* number -> valid index into [lines] */
  const idx=(a)=>{a|=0;l=all_lines().length;if(0<=a&&a<l){return a;}if(a>=l){return l-1;}return Math.max(0,a+l);};
  /* (a+i.b) { cutLF lines */
  const lines=(a,b)=>{const c=idx(a); return all_lines().slice(c,Math.max(c,c+b|0));};
  const put=(a)=>{my.str=a;};
  // TODO all of these
  const ins=(a,b)=>{};/* insert string (a) at position(s) (b) */
  const del=(a,b)=>{};/* delete #(a) chars at position(s) (b) */
  const save=(a)=>{};/* Send a save/commit request to persistent storage. */

  /* Listen to messages. */
  const hears=(a)=>{
    let status=0;
    if(a && 'done'===a.status){
      let n=a.keys.length-1, last=[a.keys[n], a.mods[n], a.part[n]];
      if(last[2]==='motion'){
        status=1;
        switch(last[0]){
        case'j':pt.line+=1;break;
        case'k':pt.line-=1;break;
        case'h':pt.col-=1;break;
        case'l':pt.col+=1;break;
        }
      }
    } return status;
  };

  return ({lines, put, hears, pt});
};
