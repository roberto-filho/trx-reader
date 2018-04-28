const expect = require('chai')
    // .use(require('chai-json-schema'))
    .use(require('chai-as-promised'))
    .expect;

const BankTransactionCategorizer = require('./BankTransactionCategorizer');

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
        const categories = JSON.parse(require('fs').readFileSync('test-categories.json', 'utf8'));

        const categorizer = new BankTransactionCategorizer();

        describe('categorize single', () => {
            const emptyCategorizedTransaction = categorizer.categorize([mockTransactionRowWithBarDescription], categories);
            const categorizedTransaction = categorizer.categorize([mockTransactionRowWithBarAndRestauranteInDescription], categories);

            it('should return an empty object with no categories', () => {
                return expect(emptyCategorizedTransaction).to.be.an('object').and.be.empty;
            });

            it('should return an objet with one category', () => {
                return expect(categorizedTransaction).to.be.an('object').and.have.property('1').with.lengthOf(1);
            });
        });

        describe('categorize all', () => {
            
        });

        describe('with empty transactions argument', () => {
            const categorizedTransactions = categorizer.categorize([], categories);

            it('should return a valid value', () => {
                return expect(categorizedTransactions).to.not.be.null.and.not.be.undefined;
            });
    
            it('should return an empty object if no transactions were entered', () => {
                return expect(categorizedTransactions).to.be.empty;
            });
        })
    });

});
