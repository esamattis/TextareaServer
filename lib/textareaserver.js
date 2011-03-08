(function() {
  var DIR, actions, cleanUuid, cli, clients, exec, file, fs, http, io, path, server, socket, stats, _i, _len, _ref;
  http = require("http");
  exec = require('child_process').exec;
  fs = require("fs");
  path = require("path");
  io = require("socket.io");
  cli = require("cli");
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
            return editor = exec(cmd, function(errno, stdout, stderr) {
              return fs.readFile(path.join(DIR, cleanUuid(msg.uuid)), function(err, data) {
                var resmsg;
                if (client) {
                  resmsg = {
                    textarea: data.toString(),
                    uuid: cleanUuid(msg.uuid)
                  };
                  return client.send(JSON.stringify(resmsg));
                }
              });
            });
          }
        });
      };
      try {
        server.listen(options.port, options.host);
        return console.log("TextareaServer is running at " + options.host + ":" + options.port);
      } catch (error) {
        console.log("Could now start the server: " + error.message);
        return process.exit(1);
      }
    });
  };
}).call(this);
