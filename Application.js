function _getPort() {
  return process.env['PORT'] || 3000;
}

function _getCORSAddress() {
  return process.env['CORS'] || 'http://localhost:3000';
}

function _getDatabaseUrl() {
  return process.env['DB_URL'] || 'mongodb://localhost:27017';
}

function _getDatabaseName() {
  return process.env['DB_NAME'] || 'bank';
}

module.exports = class Application {
  
  constructor () {
  }

  static getCurrentSettings() { 
    return {
      port: _getPort(),
      corsAddress: _getCORSAddress(),
      databaseUrl: _getDatabaseUrl(),
      database: _getDatabaseName(),
    }
  }

}
