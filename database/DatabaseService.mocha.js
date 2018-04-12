const assert = require('assert');
const expect = require('chai')
    .use(require('chai-as-promised'))
    .expect;

const DatabaseService = require('./DatabaseService');

describe('DatabaseService', function () {

  describe('#connect', () => {
    const promise = DatabaseService.connect().then(connection => {
      const connected = connection.isConnected('bank');
      // Always close the connection
      connection.close();

      return connected;
    });

    it('should connect successfully', () => {
      expect(promise, 'could not connect').to.eventually.be.true;
    });

  });

  describe('#insert', function () {
    it('should insert a category', () => {
      const promisedInserted = DatabaseService.insertCategory({description: 'teste'});

      expect(promisedInserted.then(r => r.ops[0]), 'returned a category with _id').to.eventually.have.property('_id');
    });
  });

  describe('delete', function () {
    it('should delete all categories', async () => {
      const promisedDelete = DatabaseService.deleteAllCategories();
      expect(promisedDelete, 'did not delete all categories').to.eventually.have.property('deletedCount');
    });
  });
});
