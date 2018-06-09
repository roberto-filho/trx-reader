const assert = require('assert');
const expect = require('chai')
    .use(require('chai-as-promised'))
    .expect;
const fs = require('fs');

const BankFileHeaderReader = require('./BankFileHeaderReader');
const DatabaseService = require('../database/DatabaseService');
const UploadResource = require('../resources/UploadResource');

const TEST_EXTRATO_FILE_PATH = 'test/Extrato-2018-04.csv';

describe('BankFileHeaderReader', function () {

  const headerReader = new BankFileHeaderReader();

  describe('#_getFileHeader', function () {
    const promisedHeader = headerReader.readFileHeader(TEST_EXTRATO_FILE_PATH);

    promisedHeader.catch((err) => assert.fail(err));

    it('should return something', () => {
      return expect(promisedHeader, 'did not return an empty object')
        .to.eventually.not.be.null.and.not.be.undefined;
    });

    it('should read a header', () => {
      return expect(promisedHeader, 'did not return an empty object')
        .to.eventually.be.eql({
          accountNumber: '10873740',
          startDate: '05/01/2018',
          endDate: '05/26/2018'
        });
    });
  });

});

describe('UploadResource', function () {

  describe('#_saveFileHeader', function () {
    const fileHeaderPromise = new UploadResource()._saveFileHeader(TEST_EXTRATO_FILE_PATH);

    it('should save a file header', async () => {
      return expect(fileHeaderPromise).to.eventually.be.fulfilled;
    });
    
    after(async () => {
      // Clear the database of file headers
      await DatabaseService.deleteAllFileHeaders();
    });
  });

})
