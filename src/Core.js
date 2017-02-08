/* Core.js: input | core | render */
const Core=()=>{/* String (looks like an array of lines). */
  const
  my={str:''},/* Document (string) */
  cursor={line:0, col:0, maxcol:0, height:1.0, scroll:false, color:'normal'},

  /* Document */
  all_lines=()=>my.str.match(/^.*/mg),
  idx=(n)=>{/* number -> valid index into [lines] */
    n|=0;const l=all_lines().length;
    if(0<=n&&n<l){return n;}
    if(n>=l){return l-1;}
    return Math.max(0,n+l);
  },
  lines=(start,count)=>{/* (start+i.count) { cutLF lines */
    const c=idx(start); return all_lines().slice(c,Math.max(c,c+count|0));
  },
  put=(a)=>{my.str=a;},
  ins=(a,b)=>{},/* TODO insert string (a) at position(s) (b) */
  del=(a,b)=>{},/* TODO delete #(a) chars at position(s) (b) */

  /* Storage */
  save=(a)=>{},/* TODO Send a save/commit request to persistent storage. */

  /* Plugins */
  dispatch=(a)=>{},/* TODO given a ParsedEvent, possibly invoke some functions */

  /* Listener */
  hears=(parsed)=>{
    /* TODO plugins.dispatch(parsed) replaces all of this */
    let heard=false;
    if(parsed && 'done'===parsed.status){
      let n=parsed.keys.length-1, last=[parsed.keys[n], parsed.mods[n], parsed.part[n]];
      if(last[2]==='motion'){
        heard=true;
        switch(last[0]){
        case'j':cursor.line=Math.min(all_lines().length, cursor.line+1);break;
        case'k':cursor.line=Math.max(0,cursor.line-1);break;
        case'h':cursor.col-=1;break;
        case'l':cursor.col+=1;break;
        }
      }
    } return heard;
  };

  return ({lines, put, hears, cursor, all_lines});
};
