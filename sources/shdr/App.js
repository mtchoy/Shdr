// Generated by CoffeeScript 1.4.0
(function() {
  var App;

  App = (function() {

    App.UPDATE_ALL = 0;

    App.UPDATE_ENTER = 1;

    App.UPDATE_MANUAL = 2;

    App.FRAGMENT = 0;

    App.VERTEX = 1;

    function App(domEditor, domCanvas, conf) {
      var _this = this;
      if (conf == null) {
        conf = {};
      }
      window.THREE_SHADER_OVERRIDE = true;
      this.initBaseurl();
      this.documents = ['', ''];
      this.marker = null;
      this.viewer = null;
      this.validator = null;
      this.conf = {
        update: App.UPDATE_ALL,
        mode: App.FRAGMENT
      };
      this.extend(this.conf, conf);
      this.ui = new shdr.UI(this);
      if (!this.initViewer(domCanvas)) {
        return;
      }
      this.initEditor(domEditor);
      this.initFromURL();
      this.byId(domEditor).addEventListener('keyup', (function(e) {
        return _this.onEditorKeyUp(e);
      }), false);
      this.byId(domEditor).addEventListener('keydown', (function(e) {
        return _this.onEditorKeyDown(e);
      }), false);
      this.ui.hideMainLoader();
      this.loop();
    }

    App.prototype.initBaseurl = function() {
      var hash, url;
      url = window.location.href;
      hash = url.indexOf('#');
      if (hash > 0) {
        return this.baseurl = url.substr(0, hash);
      } else {
        return this.baseurl = url;
      }
    };

    App.prototype.initViewer = function(domCanvas) {
      var conf, msg;
      try {
        this.viewer = new shdr.Viewer(this.byId(domCanvas), this);
        this.validator = new shdr.Validator(this.viewer.canvas);
      } catch (e) {
        msg = "Unable to start Shdr. \n\nWebGL is either deactivated or not supported by your device or browser. \n\nWould you like to visit get.webgl.org for more info?";
        this.ui.setStatus(msg, shdr.UI.WARNING);
        conf = confirm(msg);
        if (conf) {
          location.href = "http://get.webgl.org/";
        }
        return false;
      }
      return true;
    };

    App.prototype.initEditor = function(domEditor) {
      this.documents[App.FRAGMENT] = this.viewer.fs;
      this.documents[App.VERTEX] = this.viewer.vs;
      this.editor = ace.edit(domEditor);
      this.editor.setFontSize("16px");
      this.editor.setShowPrintMargin(false);
      this.editor.getSession().setTabSize(2);
      this.editor.getSession().setMode("ace/mode/glsl");
      this.editor.getSession().setUseWrapMode(true);
      this.editor.getSession().setValue(this.documents[this.conf.mode]);
      return this.editor.focus();
    };

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
      var line, msg, ok, session, src, type, _ref;
      session = this.editor.getSession();
      if (this.marker != null) {
        session.removeMarker(this.marker.id);
      }
      if (this.conf.mode === App.FRAGMENT) {
        type = shdr.Validator.FRAGMENT;
      } else {
        type = shdr.Validator.VERTEX;
      }
      src = session.getValue();
      if (!src) {
        this.ui.setStatus('Shader cannot be empty', shdr.UI.WARNING);
        this.marker = session.highlightLines(0, 0);
        return;
      }
      _ref = this.validator.validate(src, type), ok = _ref[0], line = _ref[1], msg = _ref[2];
      if (ok) {
        this.viewer.updateShader(src, this.conf.mode);
        return this.ui.setStatus('Shader successfully compiled', shdr.UI.SUCCESS);
      } else {
        line = Math.max(0, line - 1);
        this.marker = session.highlightLines(line, line);
        return this.ui.setStatus("Line " + line + " : " + msg, shdr.UI.ERROR);
      }
    };

    App.prototype.initFromURL = function() {
      var fl, fm, fs, obj, vl, vm, vs, _fs, _ref, _ref1, _vs;
      obj = this.unpackURL();
      if (obj && obj.documents && obj.documents.length === 2) {
        this.documents = obj.documents;
        fs = this.documents[App.FRAGMENT];
        vs = this.documents[App.VERTEX];
        _ref = this.validator.validate(fs, shdr.Validator.FRAGMENT), _fs = _ref[0], fl = _ref[1], fm = _ref[2];
        _ref1 = this.validator.validate(vs, shdr.Validator.VERTEX), _vs = _ref1[0], vl = _ref1[1], vm = _ref1[2];
        if (_fs && _vs) {
          this.viewer.updateShader(vs, App.VERTEX);
          this.viewer.updateShader(fs, App.FRAGMENT);
          this.editor.getSession().setValue(this.conf.mode === App.VERTEX ? vs : fs);
          this.ui.setMenuMode(App.FRAGMENT);
          this.ui.setStatus("Shaders successfully loaded and compiled from URL.", shdr.UI.SUCCESS);
        } else if (_vs) {
          this.viewer.updateShader(vs, App.VERTEX);
          this.setMode(App.FRAGMENT, true);
          this.ui.setMenuMode(App.FRAGMENT);
          this.ui.setStatus("Shaders loaded from URL but Fragment could not compile. Line " + fl + " : " + fm, shdr.UI.WARNING);
        } else if (_fs) {
          this.viewer.updateShader(fs, App.FRAGMENT);
          this.setMode(App.VERTEX, true);
          this.ui.setMenuMode(App.VERTEX);
          this.ui.setStatus("Shaders loaded from URL but Vertex could not compile. Line " + vl + " : " + vm, shdr.UI.WARNING);
        } else {
          this.setMode(App.VERTEX, true);
          this.ui.setMenuMode(App.VERTEX);
          this.ui.setStatus("Shaders loaded from URL but could not compile. Line " + vl + " : " + vm, shdr.UI.WARNING);
        }
        this.editor.focus();
        return true;
      } else {
        return false;
      }
    };

    App.prototype.packURL = function() {
      var json, obj, packed;
      try {
        obj = {
          documents: this.documents,
          model: this.viewer.currentModel
        };
        json = JSON.stringify(obj);
        packed = window.btoa(RawDeflate.deflate(json));
        return this.baseurl + '#1/' + packed;
      } catch (e) {
        return this.ui.setStatus("Unable to pack document: " + (typeof e.getMessage === "function" ? e.getMessage() : void 0), shdr.UI.WARNING);
      }
    };

    App.prototype.unpackURL = function() {
      var hash, json, obj, packed, version;
      if (!window.location.hash) {
        return false;
      }
      try {
        hash = window.location.hash.substr(1);
        version = hash.substr(0, 2);
        packed = hash.substr(2);
        json = RawDeflate.inflate(window.atob(packed));
        obj = JSON.parse(json);
        return obj;
      } catch (e) {
        return this.ui.setStatus("Unable to unpack document: " + (typeof e.getMessage === "function" ? e.getMessage() : void 0), shdr.UI.WARNING);
      }
    };

    App.prototype.download = function() {
      var blob, url, win;
      try {
        blob = new Blob([this.editor.getSession().getValue()], {
          type: 'text/plain'
        });
        url = URL.createObjectURL(blob);
        win = window.open(url, '_blank');
        if (win) {
          win.focus();
        } else {
          this.ui.setStatus('Your browser as blocked the download, please disable popup blocker.', shdr.UI.WARNING);
        }
      } catch (e) {
        this.ui.setStatus('Your browser does not support Blob, unable to download.', shdr.UI.WARNING);
      }
      return url;
    };

    App.prototype.updateDocument = function() {
      return this.documents[this.conf.mode] = this.editor.getSession().getValue();
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
      this.conf.update = parseInt(mode);
      return this;
    };

    App.prototype.setMode = function(mode, force) {
      var old, session;
      if (mode == null) {
        mode = App.FRAGMENT;
      }
      if (force == null) {
        force = false;
      }
      mode = parseInt(mode);
      if (this.conf.mode === mode && !force) {
        return false;
      }
      old = this.conf.mode;
      this.conf.mode = mode;
      session = this.editor.getSession();
      switch (mode) {
        case App.FRAGMENT:
          if (!force) {
            this.documents[old] = session.getValue();
          }
          session.setValue(this.documents[App.FRAGMENT]);
          break;
        case App.VERTEX:
          if (!force) {
            this.documents[old] = session.getValue();
          }
          session.setValue(this.documents[App.VERTEX]);
      }
      this.updateShader();
      return this;
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

    return App;

  })();

  this.shdr || (this.shdr = {});

  this.shdr.App = App;

}).call(this);
