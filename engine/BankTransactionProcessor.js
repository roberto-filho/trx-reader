const BankTransactionReader = require('./BankTransactionReader');
const BankTransactionCategorizer = require('./BankTransactionCategorizer');
const DatabaseService = require('../database/DatabaseService');

const BankFileProcessor = require('./BankFileProcessor');

const reader = new BankTransactionReader();

module.exports = class BankTransactionProcessor {
  constructor () {
    
  }

  async processFile(file) {
    const insertedHeader = await BankFileProcessor._saveFileHeader(file);
    const transactionObjects = await reader.readFile(file);
    const categories = await DatabaseService.listAllCategories();
    
    const savedTrxs = await this._saveTransactions(transactionObjects, insertedHeader);
    
    // Check if all transactions have categories
    // All that don't fall into a category should have one created
    const categorizer = new BankTransactionCategorizer();

    // For each transaction, check for user categories
    // If there is one, the associate and we're done.

    // If one is not found, check for default category.
  
    const categorized = categorizer.addManyCategoriesToTransactions(transactionObjects, categories);
  
    return categorized;
  }

  _saveTransactions(transactions, header) {
    // Save the transactions to the database
    transactions.forEach(trx => {
      // Add the header reference to the transactions
      trx.uploadedHeaders_id = header._id.toString();
    });

    return DatabaseService.insert('transactions', transactions)
      .then(saved => saved.ops);
  }

}
