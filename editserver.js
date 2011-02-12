(function() {
  var DIR, Inotify, actions, cli, clients, exec, file, fs, http, inotify, io, path, server, socket, stats, _i, _len, _ref;
  http = require("http");
  exec = require('child_process').exec;
  fs = require("fs");
  path = require("path");
  io = require("socket.io");
  cli = require("cli").enable('daemon');
  Inotify = require('inotify').Inotify;
  DIR = path.join(process.env['HOME'], ".textareaserver");
  try {
    stats = fs.realpathSync(DIR);
  } catch (error) {
    fs.mkdirSync(DIR, 0777);
  }
  _ref = fs.readdirSync(DIR);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    file = _ref[_i];
    fs.unlink(path.join(DIR, file));
  }
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
      return fs.readFile(path.join(DIR, event.name), function(err, data) {
        var client, msg;
        client = clients[event.name];
        if (client) {
          msg = {
            textarea: data.toString(),
            uuid: event.name
          };
          return client.send(JSON.stringify(msg));
        }
      });
    }
  });
  actions = {
    "delete": function(client, msg) {
      var uuid, _i, _len, _ref, _results;
      _ref = msg.uuids;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        uuid = _ref[_i];
        delete clients[uuid];
        console.log(path.join(DIR, uuid));
        _results.push(fs.unlink(path.join(DIR, uuid)));
      }
      return _results;
    },
    open: function(client, msg) {
      clients[msg.uuid] = client;
      file = path.join(DIR, msg.uuid);
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
