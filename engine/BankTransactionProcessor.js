const BankTransactionReader = require('./BankTransactionReader');
const BankTransactionCategorizer = require('./BankTransactionCategorizer');
const DatabaseService = require('../database/DatabaseService');

const reader = new BankTransactionReader();

class BankTransactionProcessor {
  constructor () {
    
  }

  processFile(file) {
    return DatabaseService.listAllCategories().then(categories => {
      return reader.readFile(file).then(transactionObjects => {
        const categorizer = new BankTransactionCategorizer();
      
        const categorized = categorizer.categorize(transactionObjects, categories);
      
        return categorized;
      });
    });
  }

  _saveTransactions(transactions) {

  }

}

module.exports = BankTransactionProcessor