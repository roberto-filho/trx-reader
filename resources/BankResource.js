const fs = require('fs');

class BankResource {

  registerPaths(express) {
    // Express busboy for parsing uploads.
    var bb = require('express-busboy');
    bb.extend(express, {
      upload: true,
      allowedPath: (url) => url == '/api/bank/upload'
    });

    express.post('/api/bank/upload', this.uploadFile);
  }

  /**
   * Upload a file
   * @param {object} request the request
   * @param {object} response the response
   */
  uploadFile(req, res) {

    const BankTransactionReader = require('../engine/BankTransactionReader');

    const trxReader = new BankTransactionReader();

    if (Object.keys(req.files).length === 0) {
      // There is no file upload, throw error
      res.status(422).json({error: 'No file to upload.'}).end();
    } else {
      // Parse only first file
      const firstFile = Object.keys(req.files)[0];

      trxReader.readFile(req.files[firstFile].file)
        .then(transactions => {
          res.json(transactions).end();
        })
        .catch((err) => {
          res.status(500).json(err).end();
        });
    }
  }

}

module.exports = BankResource;