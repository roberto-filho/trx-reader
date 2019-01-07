const BankFileHeaderReader = require('./BankFileHeaderReader');
const BankTransactionReader = require('../engine/BankTransactionReader');

const DatabaseService = require('../database/DatabaseService');

module.exports = class BankFileProcessor {
  constructor () {
    
  }

  static async processFile(filePath) {
    // Save the header to the database.
    const insertedHeader = await this._saveFileHeader(filePath);

    console.log('Saved header: ', JSON.stringify(insertedHeader));

    const trxReader = new BankTransactionReader();
    const transactions = await trxReader.readFile(filePath);
    // Fork and save the transactions
    this._saveTransactions(transactions, insertedHeader);

    return transactions;
  }

  /**
   * Reads the header of the transaction file and saves it.
   * @param {string} filePath the path of the transaction file.
   * @returns {object} the inserted object.
   */
  static async _saveFileHeader(filePath) {
    const headerReader = new BankFileHeaderReader();

    const header = await headerReader.readFileHeader(filePath);
    // Save header to database
    const headerInsertionReturn = await DatabaseService.insertHeader(header);
    
    return headerInsertionReturn.ops[0];
  }

  /**
   * Associates the header to each transaction and then
   * saves the bank transactions.
   * @param {string} transactions the transactions to be saved.
   * @param {object} header the header object to be associated
   * with these transactions.
   * @returns {object} the inserted objects.
   */
  static async _saveTransactions(transactions, header) {
    // Save the transactions to the database
    transactions.forEach(trx => {
      // Add the header reference to the transactions
      trx.uploadedHeaders_id = header._id.toString();
    });

    const databaseReturn = await DatabaseService.insert('transactions', transactions);

    return databaseReturn.ops;
  }

}
