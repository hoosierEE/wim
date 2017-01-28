<p align="center"><img src="images/wim-128.png" /></p>

Wim (work in progress) is a modal text editing control, implemented in a web page.
It is the successor to [cred](https://github.com/hoosierEE/cred).

Everything below here is a desired (and maybe implemented) feature.

* Input
  Inspired by Vim and Spacemacs.

  * modal
    When in Insert mode, Emacs-style commands may be used.
    Otherwise you can use Vim style commands.

  * other modes -- mostly Spacemacs-inspired
    - shared clipboard between Wim and main system.
    - find-file
    - js-git integration

* Display -- currently renders to canvas.

  Still not commited to a particular rendering backend.
  DOM has a lot of already-made toys.
  On the other hand, canvas is closer to WebGL, which could be interesting.
  

