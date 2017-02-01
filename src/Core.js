/* Core.js has 2 main responsibilities:
 1. accept messages from input devices TODO
 2. and send messages to output devices (supports canvas only)

 But eventually it should be the interface which arbitrates messages among ALL plugins,
 including things like syntax highlighting, spell checking, indentation, etc. */
const rxmatches=(a,b)=>{let r=[],m;while((m=a.exec(b))!==null){r.push(m.index);}return r;};
const Core=()=>{/* String (looks like an array of lines). */
  const my={str:'', starts:[], lines:[]};

  // TODO are these even needed since all_lines works for the main use case?
  const line_starts=()=>{return[0,...my.starts];};/* Overwrite; prepend 0. */
  const regen_line_starts=()=>{my.starts=rxmatches(/\n/g,my.str);};

  const all_lines=()=>my.str.match(/^.*/mg);

  const put=(a)=>{my.str=a; regen_line_starts();};

  // TODO separate helper fn for 0<=a<=len, can be used elsewhere (get_lines)
  const nth_line=(a)=>{/* Int -> String */
    a=a|0; const lns=my.starts, len=lns.length;
    if(0<a && a<len){return my.str.slice(lns[a-1]+1   ,lns[a]);}/* middle */
    else if(0===a)  {return my.str.slice(0            ,lns[a]);}/* first */
    else if(a>=len) {return my.str.slice(lns[len-1]+1        );}/* last */
    else{return nth_line(Math.max(0,1+len+a));}/* negative from end, without wrapping */
  };

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
    nth_line,
    put
  });
};
