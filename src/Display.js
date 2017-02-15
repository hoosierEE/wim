const Display=()=>{
  let LH, LS, VS, TOP=0, dpr=1;/* Depends on user-adjustable window zoom, font size params. */
  const
  can=document.getElementById('c'),
  ctx=can.getContext('2d'),
  cfg={border:10, font:16, pad:5, line_spacing:1},/* Static (for now). */

  draw_cursors=(L,R)=>{
    ctx.save();
    const bw=0.5, cs=[
      {
        x: cfg.border+L-bw,
        y: cfg.border+LH*(core.cur.y-TOP+cfg.line_spacing/4)-bw,
        w: Math.max(4,R-L)+(2*bw),
        h: core.cur.height*LH+(2*bw),
        c:'hsl(0,100%,40%)'
      },
      {
        x: cfg.border+L,
        y: cfg.border+LH*(core.cur.y-TOP+cfg.line_spacing/4),
        w: Math.max(4,R-L),
        h: LH * core.cur.height,
        c:'hsl(9,100%,80%)'
      }
    ];
    for(let {x,y,w,h,c} of cs){ctx.fillStyle=c; ctx.fillRect(x,y,w,h);}
    ctx.restore();
  },

  draw_lines=(lines)=>lines.forEach((x,i)=>ctx.fillText(x, cfg.border, cfg.border+LH+i*LH)),

  render=(core)=>{/* Text -> Canvas () */
    ctx.clearRect(0,0,can.width,can.height);

    /* scroll? */
    if(core.cur.y>TOP+VS){TOP=core.cur.y-VS;}
    else if(core.cur.y<TOP){TOP=core.cur.y;}

    const lines=core.lines(TOP,LS), cl=lines[core.cur.y-TOP],
          [L,R]=[0,1].map(x=>ctx.measureText(cl.slice(0,core.cur.x+x)).width);
    draw_cursors(L,R);
    draw_lines(lines);
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
  return ({update,render,cfg});
};
