const Display=()=>{
  const can=document.getElementById('c'), ctx=can.getContext('2d'),
        cfg={border:20,font:16};/* Static (for now). */
  let delta_y, top, dpr;/* Depends on user-adjustable window zoom, font size params. */

  const draw_cursor=({x,y,w,h})=>{ctx.save();ctx.fillStyle='orange';ctx.fillRect(x,y,w,h);ctx.restore();};

  /* 4 measurements:
   1. cursor_line + display_line => cursor_y
   2. cursor_column => x-position (measureText)
   3. current line height => cursor height (delta_y)
   4. current letter width => cursor width (measureText) */
  const cursor_position=(line,column)=>{};

  const resize=()=>{
    dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [can.height,can.width]=[h,w].map(x=>x*dpr);

    delta_y=cfg.font*dpr*1.5;
    top=cfg.border+delta_y;

    /* Set font AFTER canvas scaling! */
    ctx.font=cfg.font*dpr+'px serif';
    console.log(ctx.font);
  };

  const render=(doc)=>{/* Text -> Canvas () */
    ctx.clearRect(0,0,can.width,can.height);
    draw_cursor({x:cfg.border,y:cfg.border+0.25*delta_y,w:600,h:delta_y});

    /* Doc should tell what line/column has the cursor, Display should turn those into x/y/w/h. */
    const lines_per_screen=can.height/delta_y,
          lines=doc.lines(doc.pt.line,lines_per_screen);
    lines.forEach((x,i)=>ctx.fillText(x, cfg.border, top+i*delta_y));
  };

  resize();
  return ({resize,render,ctx});
};
