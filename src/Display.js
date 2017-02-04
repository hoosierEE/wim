const Display=()=>{/* Display the app itself. */
  const canvas=document.getElementById('c'), ctx=canvas.getContext('2d');
  let border=20, font_size=16, delta_y, top;

  const reset=()=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    ctx.scale(dpr,dpr);
    canvas.height=h*dpr; canvas.width=w*dpr;
    canvas.style.height=h+'px'; canvas.style.width=w+'px';
    /* Set fonts AFTER canvas mod! */
    // TODO check if this works on Retina:
    // http://www.html5canvastutorials.com/tutorials/html5-canvas-text-metrics/
    delta_y=font_size*dpr*1.5;
    top=border+delta_y;
    ctx.font=font_size*dpr+'pt serif';
  };

  /* TODO
   Display should figure out how tall one line of text is (currently hardcoded in delta_y),
   and how tall the window is, and thus request from Doc enough lines to fill the screen.

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

  const render=(doc)=>{/* Text -> Canvas () */
    ctx.clearRect(0,0,canvas.width,canvas.height);
    draw_cursor({x:border,y:border+0.25*delta_y,w:800,h:200});
    /* Doc should tell what line/column has the cursor, Display should turn those into x/y/w/h. */
    doc.lines(0,15).forEach((x,i)=>ctx.fillText(x, border, top+i*delta_y));
  };

  reset();
  return ({reset,render,ctx});
};
