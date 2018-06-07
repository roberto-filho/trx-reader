const fs = require('fs');

module.exports = class CategoriesResource {

  registerPaths(express) {
    // We need to bind this function to allow it to use the other methods in this class
    // using "this"
    this.uploadFile = this.categorize.bind(this);

    express.post('/api/bank/categorize', this.categorize);
  }

  /**
   * Upload a file
   * @param {object} request the request
   * @param {object} response the response
   */
  categorize(req, res) {

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

          const DatabaseService = require('../database/DatabaseService');

          DatabaseService.listAllCategories()
            .then((categories) => {
              const BankTransactionCategorizer = require('../engine/BankTransactionCategorizer');
              const categorizer = new BankTransactionCategorizer();
              
              const categorized = categorizer.categorize(transactions, categories);

              res.json(categorized).end();
            });
        })
        .catch((err) => {
          res.status(500).json(err).end();
        });
      
    }
  }

}