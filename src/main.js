const inp=Parser(),  /* input          */
      core=Core(),   /* think about it */
      out=Display(); /* output         */

core.put("This is line 0.\n    This is line 1 (it's indented).\nThis is line 2.");
core.save();

const rsz=()=>{out.reset(); out.render(core);},
      key_dn=(e)=>console.log(JSON.stringify(inp.key_handler(e,0))),
      key_up=(e)=>inp.key_handler(e,1);
window.addEventListener('keydown',key_dn);
window.addEventListener('keyup',key_up);
window.addEventListener('load',rsz);
window.addEventListener('resize',rsz);
