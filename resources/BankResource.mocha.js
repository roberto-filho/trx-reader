const assert = require('assert');
const expect = require('chai')
    .use(require('chai-as-promised'))
    .expect;
const fs = require('fs');

const BankResource = require('./BankResource');

describe('BankResource', function () {

  describe('#_saveFileHeader', function () {
    it('should return something', () => {
      const bankResource = new BankResource();

      const promisedHeader = bankResource._getFileHeader('test/Extrato-2018-04.csv');

      promisedHeader.catch((err) => assert.fail(err));

      return expect(promisedHeader, 'did not return an empty object')
        .to.eventually.be.eql({
          accountNumber: '10873740',
          startDate: '05/01/2018',
          endDate: '05/26/2018'
        });
    });
  });

});
