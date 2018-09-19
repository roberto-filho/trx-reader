const assert = require('assert');
const expect = require('chai')
    .use(require('chai-as-promised'))
    .expect;
const fs = require('fs');
const testCategory = {
  "id": 4,
  "description": "posto colombo",
  "phrases": ["COMPRA CARTAO - COMPRA no estabelecimento POSTO COLOMBO          C"]
};

const newTestCategory = () => Object.assign({}, testCategory);

const DatabaseService = require('./DatabaseService');

const readCategoriesJson = () => {
  return JSON.parse(fs.readFileSync('test/database/categories.json', 'utf8'));
}

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
    it('should insert a category and return the id', () => {
      const promisedInserted = DatabaseService.insertCategory(newTestCategory());
      promisedInserted.catch((err) => assert.fail());

      return expect(promisedInserted.then(r => r.ops[0]), 'did not return the category\'s _id').to.eventually.have.property('_id');
    });

    it('should not allow to insert 2 categories with same id', async () => {
      const writeTwoCategories = DatabaseService.insertCategory(newTestCategory())
        .then(res => DatabaseService.insertCategory( newTestCategory() ));
      
      return expect(writeTwoCategories, 'allowed to write two categories with same id').to.eventually.be.rejected;
    });

    it('should not allow to insert 2 categories with the same description (ignoring case)', async () => {
      const firstCategory = newTestCategory();
      firstCategory.id = 1;
      const secondCategory = newTestCategory();
      // Change the id, keep the same description
      secondCategory.id = 2;

      const writeTwoCategories = DatabaseService.insertCategory(firstCategory)
        .then(res => DatabaseService.insertCategory( secondCategory ))
      
      return expect(writeTwoCategories, 'allowed to write two categories with same description').to.eventually.be.rejected;
    })
  });

  describe('#deleteAllCategories', function () {
    it('should delete all categories', async () => {
      const promisedDelete = DatabaseService.deleteAllCategories();
      
      return expect(promisedDelete, 'did not delete all categories').to.eventually.have.property('deletedCount');
    });
  });

  describe('#deleteAllFileHeaders', function () {
    it('should delete all file headers', async () => {
      const deletionPromise = DatabaseService.deleteAllFileHeaders();
      
      return expect(deletionPromise, 'did not delete all categories').to.eventually.have.property('deletedCount');
    });
  });

  describe('#listDefaultCategories', function () {

    context('when there are default and user categories in the database', function () {
      
      const testCategories = readCategoriesJson();

      before((done) => {
        DatabaseService.insert('categories', testCategories).then(done());
      });
      
      // THE REAL TEST CASES
      it('should return only the default categories', async () => {
        const categories = await DatabaseService.listDefaultCategories();
        const ids = categories.map(c => c.id);
        // Multiple expects
        return [
          expect(categories).to.have.lengthOf(3),
          expect(ids).to.have.members(['1', '3', '5']),
        ];
      });
      
      after((done) => {
        DatabaseService.deleteAllCategories().then(done());
      });

    });

  });
});
