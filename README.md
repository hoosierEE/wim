<p align="center"><img scr="images/wim-128.png" /></p>

Wim is a modal text editor Chrome app, similar to Vim, except:

- sandboxed JS versus native C
- kitchen sink versus "do one thing well"

Wim is a re-write of, and successor to [[Https://github.com/hoosierEE/cred][cred]].

# Input
Wim relies heavily on keyboard input and can be used without a mouse.
Supports most Vim commands and macros.
Vim-style commands work in Normal mode.
Emacs-style commands work while in Insert mode.
Thus Vim behavior can be removed by:

- start editor in Insert mode
- disable "escape to Normal mode" commands

## editing modes
- normal
- insert (emacs-like key chords work in this mode)
- visual selction (normal, line-wise, block)

## other modes
- shared clipboard
- find-file
- js-git API
- scripting/UI

# Display
When Wim is running at least 1 buffer is open and visible.
There can be multiple buffers, and each one occupies an HTML5 canvas element.

# Todos
- input
- display
- file I/O
- filetype-specific 'major' modes
- 'minor' modes
