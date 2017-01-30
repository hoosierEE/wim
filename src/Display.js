const Display=()=>{/* Display the app itself. */
  const canvas=document.getElementById('c'), context=canvas.getContext('2d');

  const reset=()=>{
    const dpr=window.devicePixelRatio, h=window.innerHeight, w=window.innerWidth;
    context.scale(dpr,dpr);
    [canvas.height,canvas.width]=[h,w].map(x=>dpr*x);
    [canvas.style.height,canvas.style.width]=[h,w].map(x=>x+'px');

    /* Set fonts AFTER canvas mod! */
    context.font=(18*dpr)+'px monospace';
  };

  const render=(doc)=>{/* TextDocument -> Canvas () */
    context.clearRect(0,0,canvas.width,canvas.height);
    let pos=20;
    for(let i in doc.lines){context.fillText(doc.nth_line(i),20,pos+=30);}
  };

  reset();

  return ({reset,render});
};
export {Display};
