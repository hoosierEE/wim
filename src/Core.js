const Core=(behavior)=>{
  const
  doc={str:'', lines:[]},/* Document (string) */
  cur={y:0, x:0, maxcol:0, height:1.0, scroll:false, color:'normal'},

  /* number -> valid index into [lines] */
  idx=(n)=>{n|=0;const l=doc.lines.length; if(0<=n&&n<l){return n;} if(n>=l){return l-1;} return Math.max(0,n+l);},

  /* (start+i.count) { cutLF lines */
  lines=(start,count)=>{const c=idx(start); return doc.lines.slice(c,Math.max(c,c+count|0));},

  put=(a)=>{doc.str=a; doc.lines=doc.str.match(/^.*/mg);},
  ins=(a,b)=>{},/* TODO insert string (a) at position(s) (b) */
  del=(a,b)=>{},/* TODO delete #(a) chars at position(s) (b) */
  save=(a)=>{},/* TODO Send a save/commit request to persistent storage. */

  /* Listener */
  hears=(parsed)=>{
    let heard=false;
    if(parsed){
      heard=behavior.dispatch(parsed,cur,doc.lines);
      if('continue'===parsed.status){heard=true; cur.height=0.5;}
      else{cur.height=1.0;}
    } return heard;
  };

  return ({lines, put, hears, cur});
};
