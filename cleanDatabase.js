const DatabaseService = require('./database/DatabaseService');

const collectionsToClear = process.argv.slice(2);

console.log('Clearing collections: ', collectionsToClear);

collectionsToClear.forEach(collection => {
  DatabaseService.deleteAll(collection)
    .then(dbResult => console.log(`Cleaned '${collection}'. Delete count: `, dbResult.deletedCount))
    .catch(console.error);
});