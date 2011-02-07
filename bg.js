(function() {
  var ports, socket;
  socket = new io.Socket("localhost", {
    port: 8000
  });
  chrome.contextMenus.create({
    "title": "Edit in external editor!",
    "type": "normal",
    "contexts": ["all"],
    "onclick": function(data, tab) {
      debugger;
    }
  });
  socket.connect();
  ports = {};
  socket.on("message", function(msg) {
    var obj, port;
    obj = JSON.parse(msg);
    port = ports[obj.uuid];
    return port.postMessage(obj);
  });
  chrome.extension.onConnect.addListener(function(port) {
    if (port.name !== "textareapipe") {
      return;
    }
    return port.onMessage.addListener(function(msg) {
      debugger;      ports[msg.uuid] = port;
      msg.executable = "gvim";
      return socket.send(JSON.stringify(msg));
    });
  });
}).call(this);
