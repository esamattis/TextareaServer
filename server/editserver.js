(function() {
  var DIR, Inotify, exec, fs, http, inotify, io, now, path, server, socket, temp;
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
  socket.on('connection', function(client) {
    client.on('message', function(msg) {
      var file, obj;
      obj = JSON.parse(msg);
      file = path.join(DIR, obj.uuid);
      console.log(obj);
      return fs.open(file, "w", function(err, fd) {
        return fs.write(fd, obj.textarea, obj.textarea.lenght, 0, function() {
          return fs.close(fd, function() {
            var editor;
            inotify.addWatch({
              path: DIR,
              watch_for: Inotify.IN_CLOSE_WRITE,
              callback: function(event) {
                return fs.readFile(file, function(err, data) {
                  obj.textarea = data.toString();
                  return client.send(JSON.stringify(obj));
                });
              }
            });
            if (obj.spawn) {
              return editor = exec(obj.executable + " " + file);
            }
          });
        });
      });
    });
    return client.on('disconnect', function() {
      return console.log("browser disconnected");
    });
  });
}).call(this);
