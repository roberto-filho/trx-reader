const assert = require('assert');
const expect = require('chai')
    .use(require('chai-json-schema'))
    .use(require('chai-as-promised'))
    .expect;

const BankTransactionReader = require('../engine/BankTransactionReader');
const BankTransactionCategorizer = require('../engine/BankTransactionCategorizer');

const mockTransactionRow = [
    1,
    '20/02/2018',
    'COMPRA CARTAO - COMPRA no estabelecimento COSTA TORRES LTDA      T',
    '- R$ 6,00',
    '692,10'
];

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

describe('BankTransactionReader', () => {

    describe('#readFile', () => {

        const promisedTransactions = new BankTransactionReader().readFile('Extrato.csv', 'utf8');

        it('should return a valid value', () => {
            expect(promisedTransactions, 'returned null or undefined transactions object').to.eventually.not.be.null.and.not.be.undefined;
            expect(promisedTransactions, 'returned no transactions').to.eventually.have.length.at.least(1);
        });
    });

    describe('#_toTransactionObject', () => {
        const instance = new BankTransactionReader();

        const trxObject = instance._toTransactionObject(mockTransactionRow);

        it('should return a transaction object', () => {
            expect(trxObject.index, 'index is incorrect').to.be.eq(mockTransactionRow[0]);
            expect(trxObject.date, 'date is incorrect').to.be.eq(mockTransactionRow[1]);
            expect(trxObject.description, 'description is incorrect').to.be.eq(mockTransactionRow[2]);
            expect(trxObject.value, 'value is incorrect').to.be.eq(mockTransactionRow[3]);
            expect(trxObject.balance, 'balance is incorrect').to.be.eq(mockTransactionRow[4]);
        });
    });
});

describe('BankTransactionCategorizer', () => {

    describe('#categorize', () => {
        const categories = JSON.parse(require('fs').readFileSync('test-categories.json', 'utf8'));

        const categorizer = new BankTransactionCategorizer();

        describe('categorize single', () => {
            const emptyCategorizedTransaction = categorizer.categorize([mockTransactionRowWithBarDescription], categories);
            const categorizedTransaction = categorizer.categorize([mockTransactionRowWithBarAndRestauranteInDescription], categories);

            it('should return an empty object with no categories', () => {
                expect(emptyCategorizedTransaction).to.be.an('object').and.be.empty;
            });

            it('should return an objet with one category', () => {
                expect(categorizedTransaction).to.be.an('object').and.have.property('1').with.lengthOf(1);
            });
        });

        describe('categorize all', () => {
            
        });

        describe('with empty transactions argument', () => {
            const categorizedTransactions = categorizer.categorize([], categories);

            it('should return a valid value', () => {
                expect(categorizedTransactions).to.not.be.null.and.not.be.undefined;
            });
    
            it('should return an empty object if no transactions were entered', () => {
                expect(categorizedTransactions).to.be.empty;
            });
        })
    });

});

/* JUST FOR REFERENCE
describe('Array', function () {

    describe('#indexOf()', () => {
        it('should return -1 when the value is not present', () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});
*/