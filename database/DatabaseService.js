// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'bank';

const MongoClient = require('mongodb').MongoClient;

const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

class DatabaseService {

  /**
   * Returns a promised client.
   * @returns Promise<MongoClient>
   */
  static connect() {
    const clientPromise = new Promise((resolve, reject) => {
      MongoClient.connect(url, (err, client) =>{
        if (err) {
          reject(err);
        } else {
          resolve(client);
        }
      });
    });

    return clientPromise/* .then(client => {
      console.log("Connected successfully to server");
      return client;
    }) */;
  }

  static connectToDb(client) {
    if (client) {
      return Promise.resolve(client.db(dbName));
    } else {
      return this.connect().then(client => client.db(dbName));
    }
  }

  static insertCategory(category) {
    let connection;
    return this.connect()
      .then(client => connection = client)
      .then(client => this.connectToDb(client))
      .then(db => db.collection('categories'))
      .then(collection => {
        // Check if a category with this id already exists
        return collection.findOne({id: category.id})
          .then((categoryFound) => {
            if (categoryFound) {
              connection.close();
              return Promise.reject(`Category with id [${category.id}] already exists.`);
            }
            const insertedCategory = collection.insert(category);
            return insertedCategory.then(connection.close());
          });
      });
  }

  static deleteAllCategories() {
    let connection;
    return this.connect()
      .then(client => connection = client)
      .then(client => this.connectToDb(client))
      .then(db => db.collection('categories'))
      .then(collection => {
        const promisedDelete = collection.deleteMany({});
        return promisedDelete.then(connection.close());
      })
      .catch(console.error);
  }

}

module.exports = DatabaseService;