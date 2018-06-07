module.exports = class BusboyConfigurator {

  constructor() {
    this._canUpload = this._canUpload.bind(this);
    this.addUploadPath = this.addUploadPath.bind(this);
    this._setupBusboy = this._setupBusboy.bind(this);

    this._paths = [];
  }

  addUploadPath(path) {
    this._paths.push(path);
  }

  _canUpload(path) {
    return this._paths.indexOf(path) >= 0;
  };

  configure(express) {
    this._setupBusboy(express);
  }
  
  _setupBusboy(expressApp) {
    // Express busboy for parsing uploads.
    var expBusboy = require('express-busboy');
    expBusboy.extend(expressApp, {
      upload: true,
      allowedPath: this._canUpload
      // allowedPath: /^\/api\/bank\/upload$/
    });
  }
}

