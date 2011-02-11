(function() {
  var SETTINGS, actions, createSocket, loadSocketIO, ports, reConnect, selectorPort, showTempNotification, socket;
  SETTINGS = {
    hostname: "localhost",
    port: 8000,
    editor_cmd: "gedit {file}"
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
  showTempNotification = function(msg) {
    var notification;
    notification = webkitNotifications.createNotification("icon.png", 'TextAreaConnect', msg);
    notification.show();
    return setTimeout(function() {
      return notification.cancel();
    }, 5000);
  };
  createSocket = function() {
    if (createSocket.ran) {
      return;
    }
    socket = new io.Socket(SETTINGS.hostname, {
      port: SETTINGS.port
    });
    socket.on("message", function(msg) {
      var obj, port;
      obj = JSON.parse(msg);
      port = ports[obj.uuid];
      return port.postMessage(obj);
    });
    socket.on("connect", function() {
      console.log("stopping connection poller");
      clearTimeout(reConnect.timer);
      return showTempNotification("Connected to TextAreaServer at " + socket.transport.socket.URL);
    });
    socket.on("disconnect", function() {
      showTempNotification("Disconnected from TextAreaServer at " + socket.transport.socket.URL);
      return reConnect();
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
  selectorPort = null;
  chrome.contextMenus.create({
    title: "Edit in external editor",
    contexts: ["all", "editable", "page"],
    onclick: function(onClickData, tab) {
      return chrome.tabs.sendRequest(tab.id, {
        action: "edittextarea",
        onClickData: onClickData
      });
    }
  });
  chrome.extension.onConnect.addListener(function(port) {
    if (port.name !== "textareapipe") {
      return;
    }
    return port.onMessage.addListener(function(msg) {
      return actions[msg.action](port, msg);
    });
  });
  actions = {
    "delete": function(port, msg) {
      var uuid, _i, _len, _ref;
      console.log("got from page for deleting");
      console.log(msg);
      _ref = msg.uuids;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        uuid = _ref[_i];
        delete ports[uuid];
      }
      return socket.send(JSON.stringify(msg));
    },
    open: function(port, msg) {
      ports[msg.uuid] = port;
      msg.executable = SETTINGS.editor_cmd;
      msg.type = msg.type || "txt";
      return socket.send(JSON.stringify(msg));
    }
  };
  loadSocketIO();
}).call(this);
