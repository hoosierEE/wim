/* Modules */
const core=Core(),
      win=Window(),
      doc=Doc(),
      par=Parser();

doc.put("This is line 0.\n    This is line 1 (it's indented).\nThis is line 2.");
doc.save();

/* Events */
const rsz=()=>{win.init(); win.render(doc);},
      key_dn=(e)=>console.log(JSON.stringify(par.key_handler(e,0))),
      key_up=(e)=>par.key_handler(e,1);
window.addEventListener('keydown',key_dn);
window.addEventListener('keyup',key_up);
window.addEventListener('load',rsz);
window.addEventListener('resize',rsz);
