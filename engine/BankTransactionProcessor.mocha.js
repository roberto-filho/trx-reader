const expect = require('chai')
// .use(require('chai-json-schema'))
.use(require('chai-as-promised'))
.expect;

const BankTransactionProcessor = require('./BankTransactionProcessor');

describe('BankTransactionProcessor', () => {
  
  describe('#processFile', () => {
    
    const promisedTransactions = new BankTransactionProcessor().processFile('test/Extrato-2018-04.csv');
    
    it('should return something', () => {
      return expect(promisedTransactions, 'returned null or undefined').to.eventually.not.be.null.and.not.be.undefined;
    });
  });
});
