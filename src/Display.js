const Display=()=>{
  let LH, LS, VS, TOP=0, dpr=1;/* Depends on user-adjustable window zoom, font size params. */
  const
  can=document.getElementById('c'),
  ctx=can.getContext('2d'),
  cfg={border:20, font:16, pad:5, line_spacing:1},/* Static (for now). */

  draw_cursor=({x,y,w,h},color)=>{
    ctx.save();
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h);
    ctx.restore();
  },

  render=(core)=>{/* Text -> Canvas () */
    ctx.clearRect(0,0,can.width,can.height);

    /* scroll? */
    if(core.cursor.line>TOP+VS){TOP=core.cursor.line-VS;}
    else if(core.cursor.line<TOP){TOP=core.cursor.line;}

    const
    lines=core.lines(TOP,LS),
    cl=lines[core.cursor.line-TOP],/* cursor's line */
    [L,R]=[0,1].map(x=>ctx.measureText(cl.slice(0,core.cursor.col+x)).width);

    draw_cursor({
      x: cfg.border+L-2,
      y: cfg.border+LH*(core.cursor.line-TOP+cfg.line_spacing/4)-2,
      w: Math.max(4,R-L)+4,
      h: LH+4
    },'hsl(0,100%,40%)');

    draw_cursor({
      x: cfg.border+L,
      y: cfg.border+LH*(core.cursor.line-TOP+cfg.line_spacing/4),
      w: Math.max(4,R-L),
      h: LH
    },'hsl(9,100%,80%)');

    lines.forEach((x,i)=>ctx.fillText(x, cfg.border, cfg.border+LH+i*LH));
  };

  update=()=>{
    dpr=window.devicePixelRatio;
    can.height=window.innerHeight*dpr;
    can.width=window.innerWidth*dpr;

    LH=cfg.font*dpr*cfg.line_spacing;/* line height */
    LS=Math.ceil((can.height-cfg.border*2)/LH);/* lines (including partial) */
    VS=Math.floor((can.height-cfg.border*2-LH)/LH);/* fully visible lines */

    ctx.font=cfg.font*dpr+'px monospace';
  },

  update();
  return ({update,render});
};
