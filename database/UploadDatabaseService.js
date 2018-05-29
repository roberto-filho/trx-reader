// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'bank';
const collectionName = 'uploads';
const DatabaseService = require('./DatabaseService');

class UploadDatabaseService {

  static insertFileUpload(fileUpload) {
    let connection;
    return DatabaseService.connect()
      .then(client => connection = client)
      .then(client => DatabaseService.connectToDb(client))
      .then(db => db.collection(collectionName))
      .then(collection => {
        // TODO Check if the period has already been uploaded for that account
        const insertedCategory = collection.insert(fileUpload);
        return insertedCategory.then(connection.close());
      })
      .catch((err) => connection.close());
  }

  static getAllUploads() {
    let connection;
    return DatabaseService.connect()
      .then(client => connection = client)
      .catch(err => connection.close())
      .then(client => DatabaseService.connectToDb(client))
      .then(db => db.collection(collectionName))
      .then(collection => {
        return collection.find({}).toArray().then(connection.close());
      });
  }

  static deleteUploads() {
    let connection;
    return DatabaseService.connect()
      .then(client => connection = client)
      .then(client => DatabaseService.connectToDb(client))
      .then(db => db.collection(collectionName))
      .then(collection => {
        const promisedDelete = collection.deleteMany({});
        return promisedDelete.then(connection.close());
      })
      .catch(err => connection.close());
  }

}

module.exports = UploadDatabaseService;