<p align="center">![](images/wim-128.png)</p>

Wim is a modal text editor and Chrome app, similar to Vim, except:
- sandboxed JS,HTML,CSS versus native C
- kitchen sink versus "do one thing well"

Wim is a re-write of, and successor to [cred](https://github.com/hoosierEE/cred).

# Input
In terms of user interface, Wim is inspired by Vim and Spacemacs.
However, it has some limitations due to not being a native application.

## editing modes
Wim shares Vim's Normal, Insert and Visual modes, as well as Spacemacs' multiple cursors.
Rather than define the keyboard interface (Vim or Emacs style) at config time, Wim defaults to Emacs style while in Insert mode, and Vim style otherwise.

## other modes
- shared clipboard
- find-file
- js-git integration
- scripting/UI

# Display
Wim renders text onto HTML5 canvas, with 1 canvas element per "buffer".
Wim buffers/canvases correspond to Emacs "windows".
Each buffer runs 1 major mode and possibly many minor modes, similar to Emacs.

# Todos
- input
- multiple buffers/window management
- file i/o
- major modes
- minor modes
- API so other people can write their own modes
