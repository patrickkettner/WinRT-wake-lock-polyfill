// This is built using the WinRT api, which is exposed on window.Windows
if (window.Windows) {
  // don't overwrite an existing implementation
  if (!("getWakeLock" in navigator)) {

    // Create a constructor for EventTarget that we can inherit from
    var PatchedEventTarget = function() {};
    PatchedEventTarget.prototype = EventTarget.prototype;

    PatchedEventTarget.prototype.listeners = null;

    PatchedEventTarget.prototype.addEventListener = function(type, callback) {
      if (!(type in this._listeners)) {
        this._listeners[type] = [];
      }
      this._listeners[type].push(callback);
    };

    PatchedEventTarget.prototype.removeEventListener = function(
      type,
      callback
    ) {
      if (!(type in this._listeners)) {
        return;
      }
      var stack = this._listeners[type];
      for (var i = 0, l = stack.length; i < l; i++) {
        if (stack[i] === callback) {
          stack.splice(i, 1);
          return;
        }
      }
    };

    PatchedEventTarget.prototype.dispatchEvent = function(event) {
      if (!(event.type in this._listeners)) {
        return true;
      }
      var stack = this._listeners[event.type];
      event.target = this;
      for (var i = 0, l = stack.length; i < l; i++) {
        stack[i].call(this, event);
      }
      return !event.defaultPrevented;
    };

    var WakeLock = function(type) {
      var that = this;
      this._listeners = {};
      this._display = null;
      this.onactivechange = null;
      // If the wake lock of type type is currently acquired, set active attribute of wakeLock to true, otherwise to false.
      this.active = false;
      // Set type attribute of wakeLock to type
      this.type = type;

      this.createRequest = function() {
        var event = new CustomEvent("activechange");
        console.log(that === this);
        that._display = new Windows.System.Display.DisplayRequest();
        that._display.requestActive();

        this.active = true;

        if (this.onactivechange) {
          this.onactivechange();
        }

        this.dispatchEvent(event);

        return {
          cancel: function() {
            var event = new CustomEvent("activechange");
            console.log(that === this);
            that._display.requestRelease();

            that.active = false;

            if (that.onactivechange) {
              that.onactivechange();
            }

            that.dispatchEvent(event);

            return;
          }
        };
      };
    };

    WakeLock.prototype = PatchedEventTarget.prototype;

    window.navigator.getWakeLock = function(wakeLockResolution) {
      return new Promise(function(resolve, reject) {
        var validWakeLockResolutions = ["screen", "system"];

        // An unsupported wake lock type exception is a DOMException whose name is "WakeLockTypeNotSupported".
        if (validWakeLockResolutions.indexOf(wakeLockResolution) === -1) {
          var resolution = new DOMException(
            '"' + wakeLockResolution + '" is not a valid wake-lock type',
            "WakeLockTypeNotSupported"
          );
          return reject(resolution);
        }

        // If the browsing context is not a top-level browsing context and its
        // active document's origin is not the same as that of the active
        // document of its top-level browsing context, the user agent MUST deny
        // wake lock.
        if (window.top.location.origin !== location.origin) {
          return reject();
        }

        var wakeLock = new WakeLock(wakeLockResolution);
        document.documentElement.style.backgroundColor = "blue";
        resolve(wakeLock);
      });
    };
  }
}
