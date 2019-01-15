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
  balance: '87,10',
};

const mockTransactionRowWithBarAndRestauranteInDescription = {
  index: 0,
  date: '20/02/2018',
  description: 'COMPRA CARTAO - COMPRA no estabelecimento BAR E RESTAURANTE COSTA TORRES LTDA      T',
  value: '- R$ 6,00',
  balance: '87,10',
};

const readDefaultCategories = () => {
  return JSON.parse(fs.readFileSync('test/categorizer/categories.json', 'utf8'));
}

describe('BankTransactionCategorizer', () => {
  
  describe('#sortIntoCategories', () => {
    const categories = JSON.parse(require('fs').readFileSync('test/test-categories.json', 'utf8'));
    
    const categorizer = new Categorizer();
    
    describe('when categorizing a single transation', () => {
      const emptyCategorizedTransaction = categorizer.sortIntoCategories(
        [mockTransactionRowWithBarDescription],
        categories
      );

      context('with no matches', () => {
        it('should return an empty array with no categories', () => {
          return expect(emptyCategorizedTransaction).to.be.an('array').that.is.empty;
        });
      });
      
      const categorizedTransaction = categorizer.sortIntoCategories(
        [mockTransactionRowWithBarAndRestauranteInDescription],
        categories
      );
      
      context('with matches', function () {
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
          });
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
        const categories = await promisedCategories;

        const trxWithCategories = categories
          .map(trx => trx.categories)
          .filter(categories => !!categories.length);

        return expect(trxWithCategories).to.have.lengthOf(20);
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

  context('when there is a user category', function () {
    describe('#chooseCategory', function () {

      const categorizer = new Categorizer();

      const MOCK_TRANSACTION = {
        index: 0,
        description: 'COMPRA CARTAO - COMPRA no estabelecimento TIO ZE REFEICOES E MAR'
      };

      const MOCK_CATEGORY = {
        id: 4,
        description: 'posto colombo',
        userChosen: true,
        phrases: ['COMPRA CARTAO - COMPRA no estabelecimento TIO ZE REFEICOES E MAR']
      };

      const DEFAULT_CATEGORIES = Object.freeze(readDefaultCategories());

      it('should return a user category if there is one with the transaction\'s description', async () => {
  
        const returnedCategory = categorizer.chooseCategory(MOCK_TRANSACTION, [MOCK_CATEGORY]);

        return expect(returnedCategory, 'did not return the correct category').to.have.property('id', 4);
      });

      it("should return an 'uncategorized' category if there isn't a user category with the transaction's description", async () => {
        const cat = {...MOCK_CATEGORY};
        const trx = {
          ...MOCK_TRANSACTION,
          description: 'COMPRA CARTAO - COMPRA no estabelecimento PORTAL DA VILA',
        };
        
        // No userChosen category
        cat.userChosen = true;

        const returnedCategory = categorizer.chooseCategory(trx, [cat].concat(DEFAULT_CATEGORIES));

        return expect(returnedCategory, 'did not return the correct category')
          .to.include({description: 'Uncategorized', id: 'x'})
          .and.satisfy(cat => !!!cat.userChosen);
      });

    });

  });

  context('when there are no user categories', function () {
      
    const MOCK_TRANSACTION = {
      index: 0,
      description: 'COMPRA CARTAO - COMPRA no estabelecimento TIO ZE RESTAURANTE'
    };

    const categorizer = new Categorizer();

    describe('#chooseCategory', function () {
      
      it('should choose from defaults', async () => {
        // Create the default categories
        const returnedCategory = categorizer.chooseCategory(MOCK_TRANSACTION, readDefaultCategories());

        return expect(returnedCategory, 'did not return the correct category')
          .to.have.property('id', '1');
      });

    });

  });
  
});
