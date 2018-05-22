const fs = require('fs');

class BankResource {

  registerPaths(express) {
    // Express busboy for parsing uploads.
    var expBusboy = require('express-busboy');
    expBusboy.extend(express, {
      upload: true,
      allowedPath: /^\/api\/bank\/upload$/
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
      const firstFileKey = Object.keys(req.files)[0];
      const firstFile = req.files[firstFileKey];
      const firstFilePath = firstFile.file;

      console.log(`Handling request file: ${firstFilePath}`);
      
      trxReader.readFile(firstFilePath)
        .then(transactions => {
          // Delete file after done with it
          fs.unlink(firstFilePath, (err) => {
            if (err) {
              console.error(`Error deleting file [${firstFilePath}]: ${err}`);
            }
          });

          res.json(transactions).end();
        })
        .catch((err) => {
          res.status(500).json(err).end();
        });
    }
  }

}

module.exports = BankResource;