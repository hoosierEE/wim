const Doc=()=>{/* Line-oriented, in-memory string interface. */
  const my={str:'',lines:[]};

  const rxmatches=(a,b)=>{let r=[],m;while((m=a.exec(b))!==null){r.push(m.index);}return r;};
  const lines=()=>{my.lines=rxmatches(/\n/g,my.str); return [0,...my.lines];};/* Overwrite & prefix with 0. */
  const put=(a)=>{my.str=a; lines();};

  const nth_line=(a)=>{
    a=a|0; const lns=my.lines, len=lns.length;
    if(0<a && a<len){return my.str.slice(lns[a-1]+1   ,lns[a]);}/* middle */
    else if(0===a)  {return my.str.slice(0            ,lns[a]);}/* first */
    else if(a>=len) {return my.str.slice(lns[len-1]+1        );}/* last */
    else{return nth_line(Math.max(0,1+len+a));}/* negative from end, without wrapping */
  };

  const get_lines=(a,b)=>{/* Lines (a,b] */

  };

  const ins=(a,b)=>{};/* insert string (a) at position(s) (b) */
  const del=(a,b)=>{};/* delete #(a) chars at position(s) (b) */
  const save=(a)=>{};/* Send a save/commit request to Core/backend. */

  return ({
    get raw(){return my.str;},
    get lines(){return lines();},
    del,nth_line,ins,put,save
  });
};
