const {databaseUrl, database} = require('../Application').getCurrentSettings();
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;
const MongoClient = mongodb.MongoClient;

// import { MongoClient } from 'mongodb';

/**
 * Manages database operations.
 */
class DatabaseService {
  /**
   * Returns a promised client.
   * @return {Promise} the client
   */
  static connect() {
    const clientPromise = new Promise((resolve, reject) => {
      MongoClient.connect(databaseUrl, (err, client) =>{
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

  /**
   * Connects to the database.
   * @param {Object} client the client to use to connect to the database.
   * @return {Object}
   */
  static connectToDb(client) {
    if (client) {
      return Promise.resolve(client.db(database));
    } else {
      return this.connect().then(client => client.db(database));
    }
  }

  /**
   * Insert a category into the database.
   * @param {object} category the category to be inserted
   * @return {object} the inserted category.
   */
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
                return collection.find({description: new RegExp(category.description, 'i')})
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
   * @return {array} the objects in the collection
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

  /**
   * Lists the default categories.
   * @return {array}
   */
  static async listDefaultCategories() {
    let connection = await this.connect();
    let collection = await this.connectToDb(connection)
        .then(db => db.collection('categories'));

    const cursor = await collection.find({
      $or: [
        {userChosen: false},
        {userChosen: {$exists: false}},
      ],
    });

    const result = await cursor.toArray();

    await connection.close();

    return result.map(e => e);
  }

  /**
   * Lists all categories.
   * @return {array}
   */
  static listAllCategories() {
    return this.listAll('categories');
  }

  /**
   * Lists all uploaded headers.
   * @return {array}
   */
  static listAllUploadedHeaders() {
    return this.listAll('uploadedHeaders');
  }

  /**
   * Lists all uploaded headers.
   * @return {array}
   */
  static listAllTransactions() {
    return this.listAll('transactions');
  }

  /**
   * Deletes all objects in a collection.
   * @param {string} collectionName the collection to have its elements removed.
   * @return {object}
   */
  static deleteAll(collectionName) {
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

  /**
   * Deletes all categories.
   * @return {object}
   */
  static deleteAllCategories() {
    return this.deleteAll('categories');
  }

  /**
   * Deletes all file headers.
   * @return {object}
   */
  static deleteAllFileHeaders() {
    return this.deleteAll('uploadedHeaders');
  }

  /**
   * Inserts an object in a collection. Runs no validations.
   * @param {string} collectionName the collection to insert the object into
   * @param {object} objectsToInsert the object or array of objects to insert in the collection
   * @return {object} the inserted object
   */
  static async insert(collectionName, objectsToInsert) {
    // Sanity checks
    if (typeof collectionName !== 'string') {
      throw Error(`Argument collectionName should be string. Actual: '${collectionName}'`);
    }

    let connection;
    try {

      connection = await this.connect();
      const db = await this.connectToDb(connection);
      const databaseCollection = await db.collection(collectionName);
      
      const insertionResult = await databaseCollection.insert(objectsToInsert);
      return insertionResult;

    } finally {
      if (connection) // Connection may have failed.
        await connection.close();
    }
  }

  /**
   * Should check if there is a user category.
   * @param {Object} transaction the transaction to check for user category
   * @return {object}
   */
  static getUserCategory(transaction) {
    // @TODO
    return Promise.resolve(false);
  }

  static async findMaxCategoryId() {
    let connection = await this.connect();
    let collection = await this.connectToDb(connection)
        .then(db => db.collection('categories'));

    const cursor = await collection
      .find()
      .sort({id:-1})
      .limit(1);

    const result = await cursor.next();

    await connection.close();

    return (result && result.id) || '0';
  }

  /**
   * Inserts a header into the database. No validation is done.
   * @param {object} header the header object to be inserted.
   */
  static async insertHeader(header) {
    // Add createdAt date
    header.createdAt = new Date();
    const insertionResult = await this.insert('uploadedHeaders', header);
    // console.log(JSON.stringify(insertionResult));
    return insertionResult;
  }

  static async getHeader(headerId) {
    let connection = await this.connect();
    let collection = await this.connectToDb(connection)
        .then(db => db.collection('uploadedHeaders'));

    const cursor = await collection.findOne({
      _id: ObjectId(headerId)
    });

    const result = await cursor;

    await connection.close();

    return result;
  }

  static async listTransactionsByHeader(headerId, options) {
    let connection = await this.connect();
    let collection = await this.connectToDb(connection)
        .then(db => db.collection('transactions'));

    let query = collection.find({
      uploadedHeaders_id: headerId
    });

    if ((options.select || options.deselect) 
          && (Array.isArray(options.select) || Array.isArray(options.deselect))) {
      query = this._applyProjection(query, options.select, options.deselect);
    }

    const cursor = await query;

    const result = await cursor.toArray();

    await connection.close();

    return result;
  }

  /**
   * Modifies the query to select or deselect property upon
   * querying documents.
   * @param {object} query the mongodb query object.
   * @param {array} projection the array of fields to be selected.
   * @param {array} propertiesToIgnore the array of fields to ignore.
   */
  static _applyProjection(query, projection, propertiesToIgnore) {
    const projectObj = {};
    (projection||[]).forEach(property => {
      projectObj[property] = 1;
    });
    (propertiesToIgnore||[]).forEach(property => {
      projectObj[property] = 0;
    });

    return query.project(projectObj);
  }
}

module.exports = DatabaseService;
