const expect = require('chai')
  .use(require('chai-as-promised')) // .use(require('chai-json-schema'))
  .expect;

const BankTransactionProcessor = require('./BankTransactionProcessor');
const DatabaseService = require('../database/DatabaseService');

const fs = require('fs');

const CATEGORIES_FILE_PATH = 'test/trx-processor/categories.json';
const TRANSACTIONS_FILE_PATH = 'test/trx-processor/Extrato.csv';

describe('BankTransactionProcessor', () => {

  before(async (done) => {
    // console.log('Inserting categories.');
    const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE_PATH, 'utf8'));
    // Insert all categories
    DatabaseService.insert('categories', categories)
      .then(JSON.stringify)
      // .then(console.log)
      .then(done());
  });
  
  describe('#processFile', () => {
    
    const promisedTransactions = new BankTransactionProcessor().processFile(TRANSACTIONS_FILE_PATH);
    
    it('should return something', () => {
      return expect(promisedTransactions, 'returned null or undefined').to.eventually.not.be.null.and.not.be.undefined;
    });

    /* it('should return no categories', async () => {
      return expect(promisedTransactions, 'returned categories.')
        .to.eventually.have.lengthOf(0);
    }); */
  });

  after(async (done) => {
    // console.log('Deleting categories.');
    return DatabaseService.deleteAllCategories()
      .then(done());;
  })
});
