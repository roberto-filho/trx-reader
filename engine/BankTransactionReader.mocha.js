const expect = require('chai')
    // .use(require('chai-json-schema'))
    .use(require('chai-as-promised'))
    .expect;

const BankTransactionReader = require('./BankTransactionReader');

const mockTransactionRow = [
    1,
    '20/02/2018',
    'COMPRA CARTAO - COMPRA no estabelecimento COSTA TORRES LTDA      T',
    '- R$ 6,00',
    '692,10'
];

describe('BankTransactionReader', () => {

    describe('#readFile', () => {

        const promisedTransactions = new BankTransactionReader().readFile('Extrato.csv', 'utf8');

        it('should return a valid value', () => {
            return expect(promisedTransactions, 'returned null or undefined transactions object').to.eventually.not.be.null.and.not.be.undefined;
            return expect(promisedTransactions, 'returned no transactions').to.eventually.have.length.at.least(1);
        });
    });

    describe('#_toTransactionObject', () => {
        const instance = new BankTransactionReader();

        const trxObject = instance._toTransactionObject(mockTransactionRow);

        it('should return a transaction object', () => {
            return expect(trxObject.index, 'index is incorrect').to.be.eq(mockTransactionRow[0]);
            return expect(trxObject.date, 'date is incorrect').to.be.eq(mockTransactionRow[1]);
            return expect(trxObject.description, 'description is incorrect').to.be.eq(mockTransactionRow[2]);
            return expect(trxObject.value, 'value is incorrect').to.be.eq(mockTransactionRow[3]);
            return expect(trxObject.balance, 'balance is incorrect').to.be.eq(mockTransactionRow[4]);
        });
    });
});
