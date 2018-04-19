const assert = require('assert');
const expect = require('chai')
    .use(require('chai-as-promised'))
    .expect;

const testCategory = {
  "id": 4,
  "description": "posto colombo",
  "phrases": ["COMPRA CARTAO - COMPRA no estabelecimento POSTO COLOMBO          C"]
};

const newTestCategory = () => Object.assign({}, testCategory);

const DatabaseService = require('./DatabaseService');

describe('DatabaseService', function () {

  describe('#connectToDb', () => {
    const promise = DatabaseService.connect().then(connection => {
      const connected = connection.isConnected('bank');
      // Always close the connection
      connection.close();

      return connected;
    });

    it('should connect successfully', () => {
      return expect(promise, 'could not connect').to.eventually.be.true;
    });

  });

  describe('#insertCategory', function () {
    it('should insert a category', () => {
      const promisedInserted = DatabaseService.insertCategory(newTestCategory());
      promisedInserted.catch((err) => assert.fail());

      return expect(promisedInserted.then(r => r.ops[0]), 'did not return the category\'s _id').to.eventually.have.property('_id');
    });

    it('should not allow to insert 2 categories with same id', async () => {
      const writeTwoCategories = DatabaseService.insertCategory(newTestCategory())
        .then(res => DatabaseService.insertCategory( newTestCategory() ));
      
      return expect(writeTwoCategories, 'allowed to write two categories with same id').to.eventually.be.rejected;
    });
  });

  describe('#deleteAllCategories', function () {
    it('should delete all categories', async () => {
      const promisedDelete = DatabaseService.deleteAllCategories();
      
      return expect(promisedDelete, 'did not delete all categories').to.eventually.have.property('deletedCount');
    });
  });
});
