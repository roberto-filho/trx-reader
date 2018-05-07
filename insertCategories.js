const BankTransactionReader = require('./engine/BankTransactionReader');
const DatabaseService = require('./database/DatabaseService');

const fileToRead = process.argv.slice(2)[0];

const reader = new BankTransactionReader();
// reader.readFile(fileToRead).then(JSON.stringify).then(console.log);

// Read categories file
const categories = JSON.parse(require('fs').readFileSync('test/test-categories.json', 'utf8'));

// Insert these categories.
categories.forEach(category => {
  DatabaseService.insertCategory(category)
    .then(console.log)
    .catch(console.error);
});