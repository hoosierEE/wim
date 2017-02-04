const Display=()=>{
  const can=document.getElementById('c'), ctx=can.getContext('2d'),
        Cfg={border:20, font_size:16};/* Static (for now). */
  let delta_y, top, dpr;/* Depends on user-adjustable window zoom, font size params. */

  /* TODO
   Display should figure out how tall one line of text is, how tall the window is,
   and thus request from Doc enough lines to fill the screen.

   Also, if we assume that the cursor is always visible, then Doc can figure out where
   the starting line is, and only needs to know *how many* lines it should return. */

  /* Doesn't care where or how big the cursor is, it just draws a rectangle. */
  const draw_cursor=({x,y,w,h})=>{
    ctx.save();
    ctx.fillStyle='orange';
    ctx.fillRect(x,y,w,delta_y);
    ctx.restore();
  };

  /* 4 measurements:
   1. cursor_line + display_line => cursor_y
   2. cursor_column => x-position (measureText)
   3. current line height => cursor height (delta_y)
   4. current letter width => cursor width (measureText)
   */
  const cursor_position=(line,column)=>{};

  const resize=()=>{
    dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    ctx.scale(dpr,dpr);
    can.height=h*dpr; can.width=w*dpr; can.style.height=h+'px'; can.style.width=w+'px';
    // console.log(`ch:${can.height} cw:${can.width} csh:${can.style.height} csw:${can.style.width}`);
    // TODO check if this works on Retina
    // http://www.html5canvastutorials.com/tutorials/html5-canvas-text-metrics/
    delta_y=Cfg.font_size*dpr*1.5;
    top=Cfg.border+delta_y;
    /* Set fonts AFTER can scaling! */
    ctx.font=Cfg.font_size*dpr+'pt serif';
  };

  const render=(doc)=>{/* Text -> Canvas () */
    ctx.clearRect(0,0,can.width,can.height);
    draw_cursor({x:Cfg.border,y:Cfg.border+0.25*delta_y,w:800,h:200});
    /* Doc should tell what line/column has the cursor, Display should turn those into x/y/w/h. */
    const lines_per_screen=(can.height/delta_y)|0,
          // TODO only request lines relative to cursor position
          doclines=doc.lines(0,lines_per_screen);
    console.log(lines_per_screen);
    doclines.forEach((x,i)=>ctx.fillText(x, Cfg.border, top+i*delta_y));
  };

  resize();
  return ({resize,render,ctx});
};
