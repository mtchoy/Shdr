// Generated by CoffeeScript 1.4.0
(function() {
  var App;

  App = (function() {

    App.UPDATE_ALL = 0;

    App.UPDATE_ENTER = 1;

    App.UPDATE_MANUAL = 2;

    function App(domEditor, domCanvas, conf) {
      var _this = this;
      if (conf == null) {
        conf = {};
      }
      this.marker = null;
      this.conf = {
        update: App.UPDATE_ALL
      };
      this.extend(this.conf, conf);
      this.ui = new shdr.UI(this);
      this.editor = ace.edit(domEditor);
      this.editor.setFontSize("16px");
      this.editor.setTheme("ace/theme/monokai");
      this.editor.getSession().setTabSize(2);
      this.editor.getSession().setMode("ace/mode/glsl");
      this.editor.getSession().setUseWrapMode(true);
      this.viewer = new shdr.Viewer(this.byId(domCanvas));
      this.validator = new shdr.Validator(this.viewer.canvas);
      this.editor.getSession().setValue(this.viewer.fs);
      this.editor.focus();
      this.byId(domEditor).addEventListener('keyup', (function(e) {
        return _this.onEditorKeyUp(e);
      }), false);
      this.byId(domEditor).addEventListener('keydown', (function(e) {
        return _this.onEditorKeyDown(e);
      }), false);
      this.loop();
    }

    App.prototype.loop = function() {
      var _this = this;
      requestAnimationFrame(function() {
        return _this.loop();
      });
      return this.update();
    };

    App.prototype.update = function() {
      return this.viewer.update();
    };

    App.prototype.updateShader = function() {
      var line, msg, ok, session, src, _ref;
      src = this.editor.getSession().getValue();
      _ref = this.validator.validate(src), ok = _ref[0], line = _ref[1], msg = _ref[2];
      if (ok) {
        return this.viewer.updateShader(src);
      } else {
        console.log(ok, line, msg);
        session = this.editor.getSession();
        if (this.marker != null) {
          session.removeMarker(this.marker.id);
        }
        return this.marker = session.highlightLines(line, line, 'hl-error', true);
      }
    };

    App.prototype.onEditorKeyUp = function(e) {
      var key, proc;
      key = e.keyCode;
      proc = this.conf.update === App.UPDATE_ENTER && key === 13;
      proc || (proc = this.conf.update === App.UPDATE_ALL);
      if (proc) {
        this.updateShader();
      }
      return true;
    };

    App.prototype.onEditorKeyDown = function(e) {
      if (this.conf.update !== App.UPDATE_MANUAL) {
        return true;
      }
      if (e.ctrlKey && e.keyCode === 83) {
        this.updateShader();
        e.cancelBubble = true;
        e.returnValue = false;
        if (typeof e.stopPropagation === "function") {
          e.stopPropagation();
        }
        if (typeof e.preventDefault === "function") {
          e.preventDefault();
        }
        return false;
      } else {
        return true;
      }
    };

    App.prototype.setUpdateMode = function(mode) {
      return this.conf.update = parseInt(mode);
    };

    App.prototype.byId = function(id) {
      return document.getElementById(id);
    };

    App.prototype.extend = function(object, properties) {
      var key, val;
      for (key in properties) {
        val = properties[key];
        object[key] = val;
      }
      return object;
    };

    App.prototype.debug = function() {
      var gl, log, shader, source;
      source = this.editor.getSession().getValue();
      gl = this.viewer.renderer.getContext();
      shader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      log = gl.getShaderInfoLog(shader);
      return this.editor.getSession().setValue(log);
    };

    return App;

  })();

  this.shdr || (this.shdr = {});

  this.shdr.App = App;

}).call(this);
