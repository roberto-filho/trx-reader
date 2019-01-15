const fs = require('fs');
const DatabaseService = require('../database/DatabaseService');

const BankFileProcessor = require('../engine/BankFileProcessor');
const BankTransactionCategorizer = require('../engine/BankTransactionCategorizer');

module.exports = class BankResource {

  registerPaths(express) {
    // We need to bind this function to allow it to use the other methods in this class
    // using "this"
    express.post('/api/bank/upload', this.uploadFile.bind(this));
  }

  /**
   * Upload a file
   * @param {object} request the request
   * @param {object} response the response
   */
  async uploadFile(req, res) {

    if (Object.keys(req.files).length === 0) {
      // There is no file upload, throw error
      res.status(422).json({message: 'No file for upload.'}).end();
    } else {
      // Parse only first file
      const firstFileKey = Object.keys(req.files)[0];
      const firstFile = req.files[firstFileKey];
      const firstFilePath = firstFile.file;

      console.log(`Handling request file: ${firstFilePath}`);

      try {
        // TODO specify the charset, we do not know if it's UTF-8
        const transactions = await BankFileProcessor.processFile(firstFilePath);
        
        // Delete file after done with it
        fs.unlink(firstFilePath, (err) => {
          if (err) {
            console.error(`Error deleting file [${firstFilePath}]: ${err}`);
          }
        });

        const categories = await DatabaseService.listAllCategories();
        const categorized = 
          new BankTransactionCategorizer()
          .addOneCategoryToTransactions(transactions, categories);

        res.json(categorized).end();
      } catch(err) {
        res.status(500).json({message: err}).end();
      }
    }
  }

}