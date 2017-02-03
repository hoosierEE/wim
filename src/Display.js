const Display=()=>{/* Display the app itself. */
  const canvas=document.getElementById('c'), context=canvas.getContext('2d');

  const reset=()=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    context.scale(dpr,dpr);
    [canvas.height,canvas.width]=[h,w].map(x=>dpr*x);
    [canvas.style.height,canvas.style.width]=[h,w].map(x=>x+'px');

    /* Set fonts AFTER canvas mod! */
    //context.font=(18*dpr)+'px monospace';
    context.font=(18*dpr)+'px serif';
  };

  /* Display should figure out how tall a line of text is, and how lines equal 1 screenful.
   Then it can ask Doc for just that many and render only those lines. */
  const render=(doc)=>{/* Text -> Canvas () */
    context.clearRect(0,0,canvas.width,canvas.height);
    let border=20,
        delta_y=40,
        top=border+delta_y;
    doc.get_lines(11,10).forEach((x,i)=>context.fillText(x, border, top+i*delta_y));
  };

  reset();
  return ({reset,render});
};
