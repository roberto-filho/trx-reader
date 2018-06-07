module.exports = class BusboyConfigurator {

  addUploadPath(path) {
    const paths = this._paths || [];
    paths.push(path);
  }

  configure(express) {
    this._setupBusboy(express);
  }
  
  _setupBusboy(expressApp) {
    // Express busboy for parsing uploads.
    var expBusboy = require('express-busboy');
    expBusboy.extend(expressApp, {
      upload: true,
      allowedPath: function(path) {
        return (this._paths || []).indexOf(path) >= 0;
      }
      // allowedPath: /^\/api\/bank\/upload$/
    });
  }
}
