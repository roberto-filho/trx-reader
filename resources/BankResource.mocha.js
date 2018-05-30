const assert = require('assert');
const expect = require('chai')
    .use(require('chai-as-promised'))
    .expect;
const fs = require('fs');

const BankResource = require('./BankResource');

const TEST_EXTRATO_FILE_PATH = 'test/Extrato-2018-04.csv';

describe('BankResource', function () {

  const bankResource = new BankResource();

  describe('#_getFileHeader', function () {
    it('should return something', () => {
      const promisedHeader = bankResource._getFileHeader(TEST_EXTRATO_FILE_PATH);

      promisedHeader.catch((err) => assert.fail(err));

      return expect(promisedHeader, 'did not return an empty object')
        .to.eventually.be.eql({
          accountNumber: '10873740',
          startDate: '05/01/2018',
          endDate: '05/26/2018'
        });
    });
  });

  describe('should save a file header', function () {
    const fileHeaderPromise = bankResource._saveFileHeader(TEST_EXTRATO_FILE_PATH);

    return expect(fileHeaderPromise).to.eventually.be.fulfilled;
  })

});
