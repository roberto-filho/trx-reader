const fs = require('fs');

const DatabaseService = require('../database/DatabaseService');

module.exports = class CategoriesResource {

  registerPaths(express) {
    // We need to bind this function to allow it to use the other methods in this class
    // using "this"
    this.uploadFile = this.categorize.bind(this);
    this.listCategories = this.listCategories.bind(this);
    this.createCategory = this.createCategory.bind(this);
    this.deleteAllCategories = this.deleteAllCategories.bind(this);

    express.post('/api/bank/categorize', this.categorize);
    
    express.post('/api/bank/categories', this.createCategory);
    express.get('/api/bank/categories', this.listCategories);
    express.delete('/api/bank/categories', this.deleteAllCategories);
  }

  listCategories (req, res) {
    return DatabaseService.listAllCategories()
      .then(categories => {
        res.status(200).json(categories);
      })
      .catch(err => {
        res.status(500).json(err).end();
      });
  }

  createCategory (req, res) {
    if (req.is('application/json')) {
      return DatabaseService.insertCategory(req.body)
        .then(inserted => {
          res.status(201)
            .json(/* {id: inserted.ops[0]._id} */inserted)
            .end();
        })
        .catch(err => {
          res.status(500).json(err).end();
        });
    } else {
      res.status(400).json({error: 'No json provided.'});
    }
  }

  deleteAllCategories (req, res) {
    return DatabaseService.deleteAllCategories()
      .then(deleted => {
        res.status(200).json(deleted).end();
      })
      .catch(err => {
        res.status(500).json(err).end();
      });
  }

  /**
   * Categorizes a file.
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