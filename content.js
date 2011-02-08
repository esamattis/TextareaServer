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
    $.fn.sizeId = function() {
      return this.height() + "" + this.width();
    };
    $.fn.sizeId = function() {
      return this.height() + "" + this.width();
    };
    $.fn.textAreaResized = function(callback) {
      return this.each(function() {
        var last, that;
        that = $(this);
        last = that.sizeId();
        that.mousedown(function() {
          return last = that.sizeId();
        });
        return that.mousemove(function() {
          if (last !== that.sizeId()) {
            return callback(that.get(0));
          }
        });
      });
    };
    $.fn.toUpperRightCorner = function(e) {
      var setPosition, that;
      e = $(e);
      that = this;
      that.after(e);
      setPosition = function() {
        var l, offset, t;
        offset = that.offset();
        l = offset.left + that.width() - e.width() - 5;
        t = offset.top;
        return e.css({
          left: "" + l + "px !important",
          top: "" + t + "px !important"
        });
      };
      setPosition();
      $(window).resize(function() {
        return setPosition();
      });
      return that.textAreaResized(function() {
        return setPosition();
      });
    };
    $.fn.addButton = function(callback) {
      return this.each(function() {
        var button, that;
        that = $(this);
        button = $("<span>", {
          "class": "edit-in-textareaserver"
        });
        button.text("edit");
        button.click(function() {
          return button.addClass("edit-active");
        });
        that.toUpperRightCorner(button);
        return callback(that, button);
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
    return $.fn.uuid.counter = 0;
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
  $(function() {
    var textarea;
    textarea = $("textarea");
    return textarea.addButton(function(textarea, button) {
      return button.click(function() {
        var sendToEditor;
        textAreas[textarea.uuid()] = textarea;
        sendToEditor = function(spawn) {
          if (spawn == null) {
            spawn = false;
          }
          return port.postMessage({
            textarea: textarea.val(),
            uuid: textarea.uuid(),
            spawn: spawn
          });
        };
        sendToEditor(true);
        return $("textarea").edited(function() {
          return sendToEditor();
        });
      });
    });
  });
}).call(this);
