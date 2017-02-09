const Display=()=>{
  let LH, LS, TOP=0, BASELINE, dpr;/* Depends on user-adjustable window zoom, font size params. */
  const
  can=document.getElementById('c'),
  ctx=can.getContext('2d'),
  cfg={border:20,font:16,pad:5},/* Static (for now). */

  draw_cursor=({x,y,w,h},color)=>{
    console.log(w);
    ctx.save();
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h);
    ctx.restore();
  },

  render=(core)=>{/* Text -> Canvas () */
    ctx.clearRect(0,0,can.width,can.height);
    // x: cfg.border + cursor column
    // y: cfg.border + cursor line * cursor height
    // w: width of current letter
    // h: line height

    /* scroll? */
    const bpad=TOP+LS-cfg.pad;
    if(cfg.pad*2>LS){TOP=core.cursor.line;}
    else{
      const len=core.all_lines().length;
      if(core.cursor.line>bpad){TOP+=Math.min(len,core.cursor.line-bpad);}
      else if(core.cursor.line<TOP+cfg.pad){TOP=Math.max(0,core.cursor.line-cfg.pad);}
    }

    const
    lines=core.lines(TOP,LS),
    cl=lines[core.cursor.line-TOP],
    cxl=cl.slice(0,core.cursor.col),
    cxr=cl.slice(0, core.cursor.col+1),
    [left,right]=[cxl,cxr].map(x=>ctx.measureText(x).width);

    draw_cursor({
      x: cfg.border+left,
      y: cfg.border+LH*(core.cursor.line-TOP+0.25),
      w: Math.max(4,right-left),
      h: LH
    },'orange');

    /* Doc should tell what line/column has the cursor, Display should turn those into x/y/w/h. */
    lines.forEach((x,i)=>ctx.fillText(x, cfg.border, BASELINE+i*LH));
  };

  update=()=>{
    dpr=window.devicePixelRatio;
    h=window.innerHeight;
    w=window.innerWidth;
    can.height=h*dpr;
    can.width=w*dpr;

    LH=cfg.font*dpr*1.5;/* line height */
    LS=can.height/LH|0;/* lines per screen */
    BASELINE=cfg.border+LH;
    /* Set font AFTER canvas scaling! */
    ctx.font=cfg.font*dpr+'px serif';
  },

  update();
  return ({update,render});
};
