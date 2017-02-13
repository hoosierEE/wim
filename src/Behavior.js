const Behavior=()=>{
  const
  result={},
  dispatch=(pe, cur, lines)=>{
    const
    n=pe.keys.length-1,
    fns={
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

    let cf=fns[pe.part[n]];
    if(cf){cf=cf[pe.keys[n]];}
    if(!cf){return false;}
    [cur.x, cur.y]=cf;
    return true;
  };

  return ({dispatch});
};
