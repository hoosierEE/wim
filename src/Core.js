/* Core.js: input | core | render */
const Core=()=>{/* String (looks like an array of lines). */
  const
  my={str:'', starts:[], lines:[]},/* Document (string) */
  cursor={line:0, col:0, maxcol:0, height:1.0, scroll:false, color:'normal'},

  /* Document */
  all_lines=()=>my.str.match(/^.*/mg),
  idx=(a)=>{/* number -> valid index into [lines] */
    a|=0;const l=all_lines().length;
    if(0<=a&&a<l){return a;}
    if(a>=l){return l-1;}
    return Math.max(0,a+l);
  },
  lines=(a,b)=>{/* (a+i.b) { cutLF lines */
    const c=idx(a);
    return all_lines().slice(c,Math.max(c,c+b|0));
  },
  put=(a)=>{my.str=a;},
  ins=(a,b)=>{},/* TODO insert string (a) at position(s) (b) */
  del=(a,b)=>{},/* TODO delete #(a) chars at position(s) (b) */

  /* Storage */
  save=(a)=>{},/* TODO Send a save/commit request to persistent storage. */

  /* Plugin */
  dispatch=(a)=>{},/* TODO given a ParsedEvent, possibly invoke some functions */

  /* Listener */
  hears=(a)=>{
    /* TODO dispatch(a) to replace all of this: */
    let heard=false;
    if(a && 'done'===a.status){
      let n=a.keys.length-1, last=[a.keys[n], a.mods[n], a.part[n]];
      if(last[2]==='motion'){
        heard=true;
        switch(last[0]){
        case'j':cursor.line+=1;break;
        case'k':cursor.line-=1;break;
        case'h':cursor.col-=1;break;
        case'l':cursor.col+=1;break;
        }
      }
    } return heard;
  };

  return ({lines, put, hears, cursor});
};
