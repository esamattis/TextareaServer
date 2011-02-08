(function() {
  var DIR, Inotify, actions, exec, fs, http, inotify, io, now, path, server, socket, temp;
  http = require("http");
  exec = require('child_process').exec;
  io = require("socket.io");
  temp = require("temp");
  fs = require("fs");
  path = require("path");
  Inotify = require('inotify').Inotify;
  DIR = path.join(process.env['HOME'], ".externaledits");
  server = http.createServer(function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    return res.end('<h1>Hello world</h1>');
  });
  server.listen(8000);
  inotify = new Inotify();
  socket = io.listen(server);
  now = function() {
    return new Date().getTime();
  };
  actions = {
    "delete": function(client, msg) {
      return console.log("we should delete " + msg.uuid);
    },
    open: function(client, msg) {
      var file;
      file = path.join(DIR, msg.uuid);
      console.log(msg);
      return fs.open(file, "w", function(err, fd) {
        return fs.write(fd, msg.textarea, msg.textarea.lenght, 0, function() {
          return fs.close(fd, function() {
            var editor;
            inotify.addWatch({
              path: DIR,
              watch_for: Inotify.IN_CLOSE_WRITE,
              callback: function(event) {
                return fs.readFile(file, function(err, data) {
                  msg.textarea = data.toString();
                  return client.send(JSON.stringify(msg));
                });
              }
            });
            if (msg.spawn) {
              return editor = exec(msg.executable.replace(/\{file\}/, file));
            }
          });
        });
      });
    }
  };
  socket.on('connection', function(client) {
    client.on('message', function(msg) {
      var action;
      msg = JSON.parse(msg);
      action = actions[msg.action];
      if (action) {
        return action(client, msg);
      } else {
        return console.log("Bad action " + msg.action);
      }
    });
    return client.on('disconnect', function() {
      return console.log("browser disconnected");
    });
  });
}).call(this);
