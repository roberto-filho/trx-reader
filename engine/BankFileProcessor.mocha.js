const assert = require('assert');
const expect = require('chai')
    .use(require('chai-as-promised'))
    .expect;
const fs = require('fs');

const DatabaseService = require('../database/DatabaseService');
const BankFileProcessor = require('../engine/BankFileProcessor');

const TEST_EXTRATO_FILE_PATH = 'test/Extrato-2018-04.csv';

describe('BankFileProcessor', function () {

  describe('#_saveFileHeader', function () {
    const fileHeaderPromise = BankFileProcessor._saveFileHeader(TEST_EXTRATO_FILE_PATH);

    it('should save a file header', async () => {
      return expect(fileHeaderPromise).to.eventually.be.fulfilled;
    });
    
    after(async () => {
      // Clear the database of file headers
      await DatabaseService.deleteAllFileHeaders();
    });
  });

});
