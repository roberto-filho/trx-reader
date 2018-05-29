const assert = require('assert');
const expect = require('chai')
    .use(require('chai-as-promised'))
    .expect;

const UploadDatabaseService = require('./UploadDatabaseService');

const mockUpload = {
  periodStart: new Date('05/01/2018'),
  periodEnd: new Date('05/31/2018'),
  accountNumber: '1998382'
}

describe('UploadDatabaseService', function () {

  describe('#insertFileUpload', function () {
    it('should insert an upload and return the id', () => {
      const promisedInserted = UploadDatabaseService.insertFileUpload(mockUpload);

      promisedInserted.catch((err) => assert.fail());

      return expect(promisedInserted.then(returnedObject => returnedObject.ops[0]), 'did not return the upload\'s _id')
        .to.eventually.have.property('_id');
    });
  });

  describe('#deleteUploads', function () {
    it('should delete all uploads', async () => {
      const deletedPromise = UploadDatabaseService.deleteUploads();
      return expect(deletedPromise, 'did not delete all uploads').to.eventually.have.property('deletedCount');
    });
  });

});
