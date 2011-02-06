

# TextAreaServer

TextAreaServer is a proof of concept for creating [It's All Text!][] clone for
Chrome. Since Chrome API won't allow spawning new external processes
TextAreaServer relies on separate http-server for starting the external
editors.

TextAreaServer is written using Node.JS, CoffeeScript, node-inotify, Socket.io
and Chrome extension API.


[It's All Text!]: https://addons.mozilla.org/en-US/firefox/addon/its-all-text/
