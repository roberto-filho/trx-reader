const fs = require('fs');

const DatabaseService = require('../database/DatabaseService');

module.exports = class UploadedHeadersResource {

  constructor () {
  }
  
  registerPaths(express) {
    // We need to bind this function to allow it to use the other methods in this class
    // using "this"
    // express.post('/api/bank/uploaded-headers', this.createUploadedHeader.bind(this));
    express.get('/api/bank/uploaded-headers', this.list.bind(this));
    // express.delete('/api/bank/categories', this.deleteHeaders.bind(this));
    express.get('/api/bank/uploaded-headers/:id', this.get.bind(this));
    express.get('/api/bank/uploaded-headers/:id/transactions', this.getTransactions.bind(this));
  }

  async list(req, res) {
    let dbHeaders;
    try {
      dbHeaders = await DatabaseService.listAllUploadedHeaders();
      res.status(200).json(dbHeaders);
    } catch(err) {
      res.status(500).json(err).end();
    }
  }

  async get(req, res) {
    const {id} = req.params;

    try {
      const header = await DatabaseService.getHeader(id);

      if (!header) {
        res.status(404).end();
      } else {
        res.status(200).json(header);
      }
    } catch(err) {
      res.status(500).json(err).end();
      console.error(err);
      
    }
  }

  async getTransactions(req, res) {
    const {id} = req.params;
    try {
      const transactions = await DatabaseService.listTransactionsByHeader(id, {
        deselect: ['uploadedHeaders_id'],
      });
      res.status(200).json(transactions);
    } catch(err) {
      res.status(500).json(err).end();
    }
  }

}