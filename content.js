(function() {
  var port, siteId, textAreas, timeStamp;
  timeStamp = new Date().getTime();
  siteId = function() {
    return location.href.replace(/[^a-zA-Z]/g, "") + "_" + timeStamp;
  };
  $.fn.uuid = function() {
    var e, uuid;
    e = $(this.get(0));
    uuid = e.data("uuid");
    if (uuid) {
      return uuid;
    } else {
      $.fn.uuid.counter += 1;
      uuid = siteId() + "_" + $.fn.uuid.counter;
      e.data("uuid", uuid);
      return uuid;
    }
  };
  $.fn.uuid.counter = 0;
  textAreas = {};
  port = chrome.extension.connect({
    name: "textareapipe"
  });
  port.onMessage.addListener(function(obj) {
    var textarea;
    console.log("getting from bg: " + obj.textarea);
    textarea = textAreas[obj.uuid];
    return textarea.text(obj.textarea);
  });
  $(function() {
    return $("textarea").click(function() {
      var textarea;
      textarea = $(this);
      textAreas[textarea.uuid()] = textarea;
      return port.postMessage({
        textarea: textarea.text(),
        uuid: textarea.uuid()
      });
    });
  });
}).call(this);
