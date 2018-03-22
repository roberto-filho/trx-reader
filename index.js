const BankTransactionReader = require('./engine/BankTransactionReader');
const BankTransactionCategorizer = require('./engine/BankTransactionCategorizer');

const fileToRead = process.argv.slice(2)[0];

const reader = new BankTransactionReader();
// reader.readFile(fileToRead).then(JSON.stringify).then(console.log);

// Read categories file
const categories = JSON.parse(require('fs').readFileSync('test-categories.json', 'utf8'));

reader.readFile(fileToRead).then(transactionObjects => {
  const categorizer = new BankTransactionCategorizer();

  const categorized = categorizer.categorize(transactionObjects, categories);

  console.log(JSON.stringify(categorized));
});