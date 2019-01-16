module.exports = class BusboyConfigurator {

  constructor() {
    this._setupBusboy = this._setupBusboy.bind(this);
  }

  addUploadPath(path) {
    this._paths.push(path);
  }

  configure(express) {
    this._setupBusboy(express);
  }
  
  _setupBusboy(expressApp) {
    // Express busboy for parsing uploads.
    var expBusboy = require('express-busboy');
    expBusboy.extend(expressApp, {
      upload: true,
      // allowedPath: this._canUpload
      // allowedPath: /^\/api\/bank\/upload/
    });
  }
}

