<p align="center"><img src="images/wim-128.png" /></p>

Wim (work in progress) is a modal text editing control, implemented in a web page.
It is the successor to [cred](https://github.com/hoosierEE/cred).

# Architecture 
  Wim is built around a Core which keeps track of the state of the text document you're editing.  It also listens to messages from input devices (keyboard, maybe mouse or touch(?)) and posts messages to output devices (canvas, maybe WebGL, native, or networked/x11) when there's something to display.  That "something" could be as simple as a blinking cursor, or as complex as updates to the syntax highlighting of the currently-displayed text.

  The above is aspirational.  Here's what currently exists:
  
  * `Parser.js` receives raw KeyboardEvent objects and turns them into messages (indicating parsing progress)
  * `Window.js` draws a string to a canvas
  * `main.js` instantiates these modules, pre-populates a string for demo purposes, and attaches event listeners to the browser's window object
  
  One goal with these separate roles is to make different backend/rendering schemes easier to experiment with.  Another is to make it easier to swap out the entire "front end" if for example you don't care for Vim-style modes, you can just use a different front-end.  I'm not sure how to go about this yet, but I'd like for this modularity to make it easy to write your own functions and just hand them to the Core.  Similar in a way to device driver handling in operating systems, my half-formed notion of how this would work is that users could provide pluggable functionality into something like a device descriptor table, and the Core could dynamically select that functionality depending on what front-ends and other plugins are present at runtime.  But this is definitely half-baked and more complex than anything else I've attempted in here so far.

# Features
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
