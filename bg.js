(function() {
  var SETTINGS, createSocket, initBridge, loadSocketIO, ports, reConnect, socket;
  SETTINGS = {
    hostname: "localhost",
    port: 8000,
    editor_cmd: "gedit"
  };
  socket = null;
  ports = {};
  loadSocketIO = function() {
    clearTimeout(loadSocketIO.timer);
    console.log("trying to get io");
    if (!window.io) {
      jQuery.getScript("http://" + SETTINGS.hostname + ":" + SETTINGS.port + "/socket.io/socket.io.js", function() {
        createSocket();
        return clearTimeout(loadSocketIO.timer);
      });
      return loadSocketIO.timer = setTimeout(loadSocketIO, 500);
    } else {
      return console.log("we aleready have io");
    }
  };
  createSocket = function() {
    if (createSocket.ran) {
      return;
    }
    socket = new io.Socket(SETTINGS.hostname, {
      port: SETTINGS.port
    });
    initBridge();
    socket.on("disconnect", reConnect);
    socket.on("connect", function() {
      console.log("stopping connection poller");
      return clearTimeout(reConnect.timer);
    });
    socket.connect();
    return createSocket.ran = true;
  };
  reConnect = function() {
    console.log("polling for connection status: " + socket.connected);
    if (!socket.connected) {
      socket.connect();
    }
    clearTimeout(reConnect.timer);
    return reConnect.timer = setTimeout(reConnect, 2000);
  };
  initBridge = function() {
    socket.on("message", function(msg) {
      var obj, port;
      obj = JSON.parse(msg);
      console.log("getting from editor");
      console.log(obj);
      port = ports[obj.uuid];
      return port.postMessage(obj);
    });
    return chrome.extension.onConnect.addListener(function(port) {
      if (port.name !== "textareapipe") {
        return;
      }
      return port.onMessage.addListener(function(msg) {
        ports[msg.uuid] = port;
        msg.executable = SETTINGS.editor_cmd;
        msg.type = msg.type || "txt";
        return socket.send(JSON.stringify(msg));
      });
    });
  };
  loadSocketIO();
}).call(this);
