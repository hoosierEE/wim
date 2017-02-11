const Core=()=>{
  const
  my={str:'', lines:[]},/* Document (string) */
  cursor={y:0, x:0, maxcol:0, height:1.0, scroll:false, color:'normal'},

  /* Document */

  /* number -> valid index into [lines] */
  idx=(n)=>{n|=0;const l=my.lines.length; if(0<=n&&n<l){return n;} if(n>=l){return l-1;} return Math.max(0,n+l);},

  /* (start+i.count) { cutLF lines */
  lines=(start,count)=>{const c=idx(start); return my.lines.slice(c,Math.max(c,c+count|0));},

  put=(a)=>{my.str=a; my.lines=my.str.match(/^.*/mg);},
  ins=(a,b)=>{},/* TODO insert string (a) at position(s) (b) */
  del=(a,b)=>{},/* TODO delete #(a) chars at position(s) (b) */
  save=(a)=>{},/* TODO Send a save/commit request to persistent storage. */

  dispatch=(pe)=>{/* TODO decouple */
    const
    n=pe.keys.length-1,
    fns={
      motion:{
        'h':[Math.max(0,cursor.x-1), cursor.y],
        'j':[cursor.x, Math.min(my.lines.length-1,cursor.y+1)],
        'k':[cursor.x, Math.max(0,cursor.y-1)],
        'l':[Math.min(Math.max(0,my.lines[cursor.y].length-1),cursor.x+1), cursor.y]
      },
      text_object:{
        '0':[0, cursor.y],
        '$':[my.lines[cursor.y].length-1, cursor.y],
        'w':[my.lines[cursor.y].slice(cursor.x).search(' ')+cursor.x+1, cursor.y]
      }
    };

    let cf=fns[pe.part[n]]; if(cf){cf=cf[pe.keys[n]];} if(!cf){return false;}
    [cursor.x, cursor.y]=cf; return true;
  },

  /* Listener */
  hears=(parsed)=>{
    let heard=false;
    if(parsed && 'done'===parsed.status){
      heard=dispatch(parsed);
    } return heard;
  };

  return ({lines, put, hears, cursor});
};
