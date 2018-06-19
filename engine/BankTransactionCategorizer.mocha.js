const expect = require('chai')
  .use(require('chai-as-promised')) // .use(require('chai-json-schema'))
  .expect;

const fs = require('fs');
const Categorizer = require('./BankTransactionCategorizer');
const Reader = require('./BankTransactionReader');

const mockTransactionRowWithBarDescription = {
  index: 1,
  date: '20/02/2018',
  description: 'COMPRA CARTAO - COMPRA no estabelecimento BAR COSTA TORRES LTDA      T',
  value: '- R$ 6,00',
  balance: '87,10'
};

const mockTransactionRowWithBarAndRestauranteInDescription = {
  index: 0,
  date: '20/02/2018',
  description: 'COMPRA CARTAO - COMPRA no estabelecimento BAR E RESTAURANTE COSTA TORRES LTDA      T',
  value: '- R$ 6,00',
  balance: '87,10'
};

describe('BankTransactionCategorizer', () => {
  
  describe('#categorize', () => {
    const categories = JSON.parse(require('fs').readFileSync('test/test-categories.json', 'utf8'));
    
    const categorizer = new Categorizer();
    
    describe('categorize single', () => {
      const emptyCategorizedTransaction = categorizer.sortIntoCategories([mockTransactionRowWithBarDescription], categories);
      const categorizedTransaction = categorizer.sortIntoCategories([mockTransactionRowWithBarAndRestauranteInDescription], categories);
      
      it('should return an empty array with no categories', () => {
        return expect(emptyCategorizedTransaction).to.be.an('array').that.is.empty;
      });
      
      context('with one category', function () {
        it('should return an array with one category', () => {
          return expect(categorizedTransaction).to.be.an('array').with.lengthOf(1);
        });
        
        const category = categorizedTransaction[0];
        
        context('with the returned the category', function () {
          it('should have a transactions object', async () => {
            return expect(category).to.have.property('transactions').with.lengthOf(1);
          });
          it('should have an id', async () => {
            return expect(category).to.have.property('id');
          })
        })
      });
    });
    
    context('with empty transactions argument', () => {
      const categorizedTransactions = categorizer.sortIntoCategories([], categories);
      
      it('should return a valid value', () => {
        return expect(categorizedTransactions).to.not.be.null.and.not.be.undefined;
      });
      
      it('should return an empty object if no transactions were entered', () => {
        return expect(categorizedTransactions).to.be.empty;
      });
    })
  });
  
  describe('#categorizeTransactions', function () {

    const categories = JSON.parse(fs.readFileSync('test/categorizer/categories.json', 'utf8'));
    
    context('with 62 elements', function () {
      const promisedCategories = new Reader().readFile('test/categorizer/Extrato.csv').then(transactions => {
  
        const categorizedTransactions = new Categorizer()
          .addManyCategoriesToTransactions(transactions, categories);
  
        return categorizedTransactions;
      });

      it('should return something', async () => {
        return expect(promisedCategories).to.eventually.not.be.undefined.and.not.be.null;
      });

      it('should return an array', async () => {
        return expect(promisedCategories).to.eventually.be.an('array');
      });

      it('should return 62 elements', async () => {
        return expect(promisedCategories).to.eventually.have.lengthOf(62);
      });
      
      it('should return elements with "categories"', async () => {
        return expect(promisedCategories).to.eventually.satisfy(trxs => trxs[0].categories);
      });

      // TODO Not use functions. Use chai array assertions

      it('should return exactly 20 transactions with categories', async () => {
        const matcher = (transactions) => {
          // console.log(JSON.stringify(transactions));
          let categoryCount = 0;
          transactions.forEach(trx => {
            if (trx.categories.length > 0) {
              categoryCount++;
            }
          });
          return categoryCount === 20;
        };

        return expect(promisedCategories).to.eventually.satisfy(matcher);
      });

      it('should return exactly 18 transactions with 2 categories', async () => {
        const matcher = (transactions) => {
          // console.log(JSON.stringify(transactions));
          let categoryCount = 0;
          transactions.forEach(trx => {
            if (trx.categories.length === 2) {
              categoryCount ++;
            }
          });
          return categoryCount === 18;
        };

        return expect(promisedCategories).to.eventually.satisfy(matcher);
      });
    });
  });
  
});
