const Window=()=>{/* Display the app itself. */
  const canvas=document.getElementById('c'), context=canvas.getContext('2d');

  const init=()=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    context.scale(dpr,dpr);
    [canvas.height,canvas.width]=[h,w].map(x=>dpr*x);
    [canvas.style.height,canvas.style.width]=[h,w].map(x=>x+'px');

    /* Set fonts AFTER canvas mod! */
    context.font=(18*dpr)+'px monospace';
  };

  const render=(text_document)=>{/* One canvasful of ...whatever. Mostly text, I'd wager. */
    context.clearRect(0,0,canvas.width,canvas.height);
    let pos=20;
    for(let i in text_document.lines){context.fillText(text_document.get_line(i),20,pos+=30);}
  };

  init();

  return ({init,render});
};
