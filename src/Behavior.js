const Behavior=()=>{
  const
  result={
    visual:false,
    selection_start:0,
    selection_end:0,
    selection_shape:['line','contiguous','rectangle'],
    editing:false,
    animating:false
  },
  dispatch=(pe, cur, lines)=>{
    const
    n=pe.keys.length-1,
    xy_delta={
      /* TODO common constraints: EOL, EOF, BOL, BOF
       could be built-in to certain actions... */
      motion:{
        'h':[Math.max(0,cur.x-1), cur.y],
        'j':[cur.x, Math.min(lines.length-1,cur.y+1)],
        'k':[cur.x, Math.max(0,cur.y-1)],
        'l':[Math.min(Math.max(0,lines[cur.y].length-1),cur.x+1), cur.y]
      },
      text_object:{
        '0':[0, cur.y],
        '$':[lines[cur.y].length-1, cur.y],
        'w':[lines[cur.y].slice(cur.x).search(' ')+cur.x+1, cur.y]
      }
    };

    /* visual */

    /* motion */
    let xyd; (xyd=xy_delta[pe.part[n]]) && (xyd=xyd[pe.keys[n]]);
    if(xyd){
      [cur.x, cur.y]=xyd;
      return true;
    } return false;
  };

  return ({dispatch});
};
