(function() {
  var port, textAreas;
  (function() {
    var siteId, timeStamp;
    timeStamp = new Date().getTime();
    siteId = function() {
      return location.href.replace(/[^a-zA-Z]/g, "") + "_" + timeStamp;
    };
    $.fn.edited = function(callback) {
      return this.each(function() {
        var $e, active, e;
        active = false;
        e = this;
        $e = $(e);
        $e.focusin(function() {
          return active = true;
        });
        $e.focusout(function() {
          return active = false;
        });
        return $(window).keyup(function() {
          if (active) {
            return callback(e);
          }
        });
      });
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
    return $.fn.editInExternalEditor = function(port) {
      var sendToEditor, that;
      that = $(this);
      if (that.data("server")) {
        return;
      }
      that.data("server", true);
      sendToEditor = function(spawn) {
        if (spawn == null) {
          spawn = false;
        }
        return port.postMessage({
          textarea: that.val(),
          uuid: that.uuid(),
          spawn: spawn,
          action: "open"
        });
      };
      that.edited(function() {
        return sendToEditor();
      });
      return sendToEditor(true);
    };
  })();
  textAreas = {};
  port = chrome.extension.connect({
    name: "textareapipe"
  });
  port.onMessage.addListener(function(obj) {
    var textarea;
    textarea = textAreas[obj.uuid];
    return textarea.val(obj.textarea);
  });
  chrome.extension.onRequest.addListener(function(req, sender) {
    var realUrl, textarea;
    if (req.action === "edittextarea") {
      console.log("frame " + req.onClickData.frameUrl + " page " + req.onClickData.pageUrl + " " + window.location.href + " ");
      realUrl = req.onClickData.frameUrl || req.onClickData.pageUrl;
      if (realUrl !== window.location.href) {
        return;
      }
      textarea = $(document.activeElement);
      textAreas[textarea.uuid()] = textarea;
      return textarea.editInExternalEditor(port);
    }
  });
  $(window).unload(function() {
    var key, ta;
    return port.postMessage({
      action: "delete_all",
      uuid: [
        (function() {
          var _ref, _results;
          _ref = ta.uuid();
          _results = [];
          for (key in _ref) {
            ta = _ref[key];
            _results.push(ta.uudi());
          }
          return _results;
        })()
      ]
    });
  });
}).call(this);
