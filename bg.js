(function() {
  var ports, socket;
  socket = new io.Socket("localhost", {
    port: 8000
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
      ports[msg.uuid] = port;
      return socket.send(JSON.stringify(msg));
    });
  });
}).call(this);
