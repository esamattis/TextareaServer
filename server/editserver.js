(function() {
  var DIR, Inotify, actions, cli, clients, exec, fs, http, inotify, io, path, server, socket;
  http = require("http");
  exec = require('child_process').exec;
  fs = require("fs");
  path = require("path");
  io = require("socket.io");
  cli = require("cli").enable('daemon');
  Inotify = require('inotify').Inotify;
  DIR = path.join(process.env['HOME'], ".externaledits");
  cli.parse({
    port: ['p', "Port to listen", "number", 8000],
    host: ['l', "Host to listen", "string", "127.0.0.1"]
  });
  inotify = new Inotify();
  server = http.createServer(function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    return res.end('<h1>Hello world</h1>');
  });
  socket = io.listen(server);
  clients = {};
  inotify.addWatch({
    path: DIR,
    watch_for: Inotify.IN_CLOSE_WRITE,
    callback: function(event) {
      console.log(event);
      return fs.readFile(path.join(DIR, event.name), function(err, data) {
        var client, msg;
        msg = {
          textarea: data.toString(),
          uuid: event.name
        };
        client = clients[event.name];
        return client.send(JSON.stringify(msg));
      });
    }
  });
  actions = {
    "delete": function(client, msg) {
      console.log("we should delete: ");
      return console.log(msg);
    },
    open: function(client, msg) {
      var file;
      clients[msg.uuid] = client;
      file = path.join(DIR, msg.uuid);
      console.log("getting form browser:");
      console.log(msg);
      return fs.writeFile(file, msg.textarea, function() {
        var editor;
        if (msg.spawn) {
          return editor = exec(msg.executable.replace(/\{file\}/, file));
        }
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
  cli.main(function(args, options) {
    return server.listen(options.port, options.host);
  });
}).call(this);
