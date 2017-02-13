const Display=()=>{
  let LH, LS, VS, TOP=0, dpr=1;/* Depends on user-adjustable window zoom, font size params. */
  const
  can=document.getElementById('c'),
  ctx=can.getContext('2d'),
  cfg={border:10, font:16, pad:5, line_spacing:1},/* Static (for now). */

  draw_cur=({x,y,w,h},color)=>{
    ctx.save();
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h);
    ctx.restore();
  },

  render=(core)=>{/* Text -> Canvas () */
    ctx.clearRect(0,0,can.width,can.height);

    /* scroll? */
    if(core.cur.y>TOP+VS){TOP=core.cur.y-VS;}
    else if(core.cur.y<TOP){TOP=core.cur.y;}

    const lines=core.lines(TOP,LS);
    const cl=lines[core.cur.y-TOP];/* cur's line */
    const [L,R]=[0,1].map(x=>ctx.measureText(cl.slice(0,core.cur.x+x)).width);

    draw_cur({
      x: cfg.border+L-1,
      y: cfg.border+LH*(core.cur.y-TOP+cfg.line_spacing/4)-1,
      w: Math.max(4,R-L)+2,
      h: LH+2
    },'hsl(0,100%,40%)');

    draw_cur({
      x: cfg.border+L,
      y: cfg.border+LH*(core.cur.y-TOP+cfg.line_spacing/4),
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
    LS=Math.ceil((can.height-cfg.border)/LH);/* lines (including partial) */
    VS=Math.floor((can.height-cfg.border*2-LH)/LH);/* fully visible lines */

    ctx.font=cfg.font*dpr+'px sans';
  },

  update();
  return ({update,render});
};
