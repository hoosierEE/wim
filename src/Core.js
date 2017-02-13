const Core=()=>{
  const
  doc={str:'', lines:[]},/* Document (string) */
  cur={y:0, x:0, maxcol:0, height:1.0, scroll:false, color:'normal'},

  /* Document */

  /* number -> valid index into [lines] */
  idx=(n)=>{n|=0;const l=doc.lines.length; if(0<=n&&n<l){return n;} if(n>=l){return l-1;} return Math.max(0,n+l);},

  /* (start+i.count) { cutLF lines */
  lines=(start,count)=>{const c=idx(start); return doc.lines.slice(c,Math.max(c,c+count|0));},

  put=(a)=>{doc.str=a; doc.lines=doc.str.match(/^.*/mg);},
  ins=(a,b)=>{},/* TODO insert string (a) at position(s) (b) */
  del=(a,b)=>{},/* TODO delete #(a) chars at position(s) (b) */
  save=(a)=>{},/* TODO Send a save/commit request to persistent storage. */

  dispatch=(pe)=>{/* TODO decouple */
    const
    n=pe.keys.length-1,
    fns={
      motion:{
        'h':[Math.max(0,cur.x-1), cur.y],
        'j':[cur.x, Math.min(doc.lines.length-1,cur.y+1)],
        'k':[cur.x, Math.max(0,cur.y-1)],
        'l':[Math.min(Math.max(0,doc.lines[cur.y].length-1),cur.x+1), cur.y]
      },
      text_object:{
        '0':[0, cur.y],
        '$':[doc.lines[cur.y].length-1, cur.y],
        'w':[doc.lines[cur.y].slice(cur.x).search(' ')+cur.x+1, cur.y] /* TODO constraints? */
      }
    };

    let cf=fns[pe.part[n]]; if(cf){cf=cf[pe.keys[n]];} if(!cf){return false;}
    [cur.x, cur.y]=cf; return true;
  },

  /* Listener */
  hears=(parsed)=>{
    let heard=false;
    if(parsed && 'done'===parsed.status){
      heard=dispatch(parsed);
    } return heard;
  };

  return ({lines, put, hears, cur});
};
