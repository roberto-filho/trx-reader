const fs = require('fs');

const DatabaseService = require('../database/DatabaseService');

module.exports = class TransactionsResource {

  constructor () {
  }
  
  registerPaths(express) {
    // We need to bind this function to allow it to use the other methods in this class
    // using "this"
    // express.post('/api/bank/uploaded-headers', this.createUploadedHeader.bind(this));
    express.get('/api/bank/transactions', this.list.bind(this));
    // express.delete('/api/bank/categories', this.deleteHeaders.bind(this));
  }

  async list(req, res) {
    let dbHeaders;
    try {
      dbHeaders = await DatabaseService.listAllTransactions();
      res.status(200).json(dbHeaders);
    } catch(err) {
      res.status(500).json(err).end();
    }
  }

}