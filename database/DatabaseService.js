// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'bank';

const MongoClient = require('mongodb').MongoClient;

// const promiseFinally = require('promise.prototype.finally');
// promiseFinally.shim();

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
          .then(categoryFound => {

            if (categoryFound) {
              connection.close();
              return Promise.reject(new Error(`Category with id [${category.id}] already exists.`));
            }

            // Check if category with the same description exists
            return collection.find({ description: new RegExp(category.description, 'i') })
              .toArray()
              .then(catWithSameDescription => {
                
                if (catWithSameDescription.length > 0) {
                  connection.close();
                  return Promise.reject(new Error(`Category with description [${category.description}] already exists.`));
                }

                const insertedCategory = collection.insert(category);
                return insertedCategory.then(connection.close());
              });
          });
      });
  }

  /**
   * Retrieves all objects from a collection.
   * Errors are logged to error console.
   * @param {string} collectionName the collection name to list.
   */
  static listAll(collectionName) {
    let connection;
    return this.connect()
      .then(client => connection = client)
      .then(client => this.connectToDb(client))
      .then(db => db.collection(collectionName))
      .then(collection => {
        return collection.find({}).toArray().then(connection.close());
      })
      .catch(console.error);
  }

  static listAllCategories() {
    return this.listAll('categories');
  }
  
  static deleteAll (collectionName) {
    let connection;
    return this.connect()
      .then(client => connection = client)
      .then(client => this.connectToDb(client))
      .then(db => db.collection(collectionName))
      .then(collection => {
        const promisedDelete = collection.deleteMany({});
        return promisedDelete.then(connection.close());
      })
      .catch(console.error);
  }
  
  static deleteAllCategories() {
    return this.deleteAll('categories');
  }

  static deleteAllFileHeaders () {
    return this.deleteAll('uploadedHeaders');
  }

  /**
   * Inserts an object in a collection. Runs no validations.
   * @param {string} collectionName the collection to insert the object into
   * @param {object} objectToInsert the object to insert in the collection
   */
  static insert(collectionName, objectToInsert) {
    let connection;
    return this.connect()
      .then(client => connection = client)
      .then(client => this.connectToDb(client))
      .then(db => db.collection(collectionName))
      .then(databaseCollection => {
        // TODO Check if the period has already been uploaded for that account
        const databaseResult = databaseCollection.insert(objectToInsert);
        return databaseResult.then(connection.close());
      })
      .catch((err) => connection.close());
  }

  /**
   * Should check if there is a user category.
   * @param {Object} transaction the transaction to check for user category
   */
  static getUserCategory(transaction) {
    // @TODO
    return Promise.resolve(false);
  }
}

module.exports = DatabaseService;