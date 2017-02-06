const Display=()=>{
  let delta_y, top, dpr, lps;/* Depends on user-adjustable window zoom, font size params. */
  const
  can=document.getElementById('c'), ctx=can.getContext('2d'), cfg={border:20,font:16},/* Static (for now). */

  draw_cursor=({x,y,w,h},color)=>{
    ctx.save();
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h);
    ctx.restore();
  },

  /* (determines if document should scroll)
   cursor_column == x-position (measureText) => x
   cursor_line + display_line => y
   current letter width == cursor width (measureText) => w
   current line height == cursor height (delta_y) => h */
  cursor_position=({line,column})=>{/* {line,column} => {x,y,w,h,scroll?} */
    let r={x:0,y:0,w:0,h:0,scroll:true};
    return r;
  },

  update=()=>{
    dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [can.height,can.width]=[h,w].map(x=>x*dpr);
    delta_y=cfg.font*dpr*1.5;
    lps=can.height/delta_y;
    top=cfg.border+delta_y;
    /* Set font AFTER canvas scaling! */
    ctx.font=cfg.font*dpr+'px serif';
  },

  render=(a)=>{/* Text -> Canvas () */
    ctx.clearRect(0,0,can.width,can.height);

    draw_cursor({x:cfg.border,y:cfg.border+0.25*delta_y,w:600,h:delta_y},'orange');

    /* Doc should tell what line/column has the cursor, Display should turn those into x/y/w/h. */
    const lines=a.lines(a.cursor.line,lps);
    lines.forEach((x,i)=>ctx.fillText(x, cfg.border, top+i*delta_y));
  };

  update();
  return ({update,render,ctx});
};
