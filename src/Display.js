const Display=()=>{
  let delta_y, initial_y, dpr, lines_per_screen;/* Depends on user-adjustable window zoom, font size params. */
  const
  can=document.getElementById('c'), ctx=can.getContext('2d'), cfg={border:20,font:16},/* Static (for now). */

  draw_cursor=({x,y,w,h},color)=>{
    ctx.save();
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h);
    ctx.restore();
  },

  cursor_position=(a)=>{/* {line,column} => {x,y,w,h,scroll?} */
    // x: cfg.border + cursor column
    // y: cfg.border + cursor line * cursor height
    // w: current letter
    // h: line height
    let r={x:cfg.border,y:cfg.border+0.25*delta_y,w:600,h:delta_y},
        dy=a.cursor.line*delta_y;

    if(dy<r.y){/* scroll up */}
    if(dy>=r.y+lines_per_screen*delta_y+cfg.border){/* scroll down */}

    // let r={x:0,y:0,w:0,h:0,scroll:true};
    return r;
  },

  update=()=>{
    dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    [can.height,can.width]=[h,w].map(x=>x*dpr);
    delta_y=cfg.font*dpr*1.5;
    lines_per_screen=can.height/delta_y;
    initial_y=cfg.border+delta_y;
    /* Set font AFTER canvas scaling! */
    ctx.font=cfg.font*dpr+'px serif';
  },

  render=(a)=>{/* Text -> Canvas () */
    ctx.clearRect(0,0,can.width,can.height);

    draw_cursor(cursor_position(a),'orange');

    /* Doc should tell what line/column has the cursor, Display should turn those into x/y/w/h. */
    const lines=a.lines(a.document.line,lines_per_screen);
    lines.forEach((x,i)=>ctx.fillText(x, cfg.border, initial_y+i*delta_y));
  };

  update();
  return ({update,render,ctx});
};
