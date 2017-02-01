/* TODO -- Core currently does ONLY: print some lines to canvas.

 The primary goals of Core is to accept messages from input devices,
 and send messages to output devices.

 Current implementation supports:
 1 input device (keyboard)
 1 output device (fullscreen canvas)

 But eventually it should be the interface which arbitrates messages among ALL plugins,
 including things like syntax highlighting, spell checking, indentation, etc.
 */
const rxmatches=(a,b)=>{let r=[],m;while((m=a.exec(b))!==null){r.push(m.index);}return r;};
const Core=()=>{/* String (looks like an array of lines). */
  const my={str:'',idxs:[]};

  const line_starts=()=>{my.idxs=rxmatches(/\n/g,my.str);return[0,...my.idxs];};/* Overwrite; prepend 0. */
  const all_lines=()=>my.str.match(/^.*/mg);

  const put=(a)=>{my.str=a; line_starts();};

  // TODO separate helper fn for 0<=a<=len, can be used elsewhere (get_lines)
  const nth_line=(a)=>{/* Int -> String */
    a=a|0; const lns=my.idxs, len=lns.length;
    if(0<a && a<len){return my.str.slice(lns[a-1]+1   ,lns[a]);}/* middle */
    else if(0===a)  {return my.str.slice(0            ,lns[a]);}/* first */
    else if(a>=len) {return my.str.slice(lns[len-1]+1        );}/* last */
    else{return nth_line(Math.max(0,1+len+a));}/* negative from end, without wrapping */
  };

  // TODO all of these
  const get_lines=(a,b)=>{};/* (a+i.b) { cutLF lines */
  const ins=(a,b)=>{};/* insert string (a) at position(s) (b) */
  const del=(a,b)=>{};/* delete #(a) chars at position(s) (b) */
  const save=(a)=>{};/* Send a save/commit request to Core/backend. */

  return ({
    get raw(){return my.str;},
    get line_starts(){return lines_starts();},
    get all_lines(){return all_lines();},
    del,nth_line,ins,put,save
  });
};
