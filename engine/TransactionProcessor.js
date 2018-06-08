const BankTransactionReader = require('./engine/BankTransactionReader');
const BankTransactionCategorizer = require('./engine/BankTransactionCategorizer');
const DatabaseService = require('./database/DatabaseService');

const reader = new BankTransactionReader();

class TransactionProcessor {
  constructor () {
    
  }

  processFile(file) {
    return DatabaseService.listAllCategories().then(categories => {
      reader.read(process.stdin).then(transactionObjects => {
        const categorizer = new BankTransactionCategorizer();
      
        const categorized = categorizer.categorize(transactionObjects, categories);
      
        console.log(JSON.stringify(categorized, null, 2));
      });
    });
  }

}

module.exports = TransactionProcessor