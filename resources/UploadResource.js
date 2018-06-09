const fs = require('fs');
const BankFileHeaderReader = require('../engine/BankFileHeaderReader');

module.exports = class BankResource {

  registerPaths(express) {
    // We need to bind this function to allow it to use the other methods in this class
    // using "this"
    this.uploadFile = this.uploadFile.bind(this);

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

      this._saveFileHeader(firstFilePath)
        .then(() => {
          trxReader.readFile(firstFilePath)
            .then(transactions => {
              // Delete file after done with it
              fs.unlink(firstFilePath, (err) => {
                if (err) {
                  console.error(`Error deleting file [${firstFilePath}]: ${err}`);
                }
              });
    
              // const DatabaseService = require('../database/DatabaseService');
    
              // DatabaseService.listAllCategories()
              //   .then((categories) => {
              //     const BankTransactionCategorizer = require('../engine/BankTransactionCategorizer');
              //     const categorizer = new BankTransactionCategorizer();
                  
              //     const categorized = categorizer.categorize(transactions, categories);
    
              //     res.json(categorized).end();
              //   });
    
              res.json(transactions).end();
            })
            .catch((err) => {
              res.status(500).json(err).end();
            });
        });
      
    }
  }

  _saveFileHeader(filePath) {
    return new BankFileHeaderReader().readFileHeader(filePath)
      .then(header => {
        // Save header to database
        // console.log(JSON.stringify(header));
        const DatabaseService = require('../database/DatabaseService');
        return DatabaseService.insert('uploadedHeaders', header);
      });
  }

}