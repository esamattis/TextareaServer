(function() {
  var DIR, Inotify, actions, cleanUuid, cli, clients, exec, file, fs, http, inotify, io, path, server, socket, stats, _i, _len, _ref;
  http = require("http");
  exec = require('child_process').exec;
  fs = require("fs");
  path = require("path");
  io = require("socket.io");
  cli = require("cli");
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
    port: ['p', "Port to listen", "number", 32942],
    host: ['l', "Host to listen", "string", "127.0.0.1"],
    "editor-cmd": ['c', 'Editor to use. {file} will substituted with the file path. Use quotes.', "string", "gedit {file}"]
  });
  inotify = new Inotify();
  server = http.createServer(function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    return res.end('<h1>Hello world</h1>');
  });
  socket = io.listen(server, {
    transports: ['websocket']
  });
  clients = {};
  cleanUuid = function(uuid) {
    return uuid.replace(/[^a-zA-Z0-9_\-]/g, "");
  };
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
  exports.run = function() {
    return cli.main(function(args, options) {
      actions.open = function(client, msg) {
        clients[msg.uuid] = client;
        file = path.join(DIR, cleanUuid(msg.uuid));
        return fs.writeFile(file, msg.textarea, function() {
          var cmd, editor, editorCmd, fileRegx;
          if (msg.spawn) {
            fileRegx = /\{ *file *\}/;
            editorCmd = options["editor-cmd"];
            if (!!editorCmd.match(fileRegx)) {
              cmd = editorCmd.replace(fileRegx, file);
            } else {
              cmd = "" + (editorCmd.trim()) + " " + file;
            }
            console.log(cmd);
            return editor = exec(cmd);
          }
        });
      };
      server.listen(options.port, options.host);
      return console.log("TextareaServer is running at " + options.host + ":" + options.port);
    });
  };
}).call(this);
