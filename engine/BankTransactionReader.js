// The number of rows to skip when reading the files.
const ROWS_TO_SKIP = 7;
// The header text
const HEADER_TEXT = 'DATA LANÇAMENTO;HISTÓRICO;VALOR;SALDO';

class BankTransactionReader {
  
  constructor() {
    this.fs = require('fs');
  }
  
  /**
  * Reads a csv file containing transactions and returns an array
  * with the contents transformed into objects.
  * @param {string} filename the file to be read
  * @param {string} charset the charset to read the file with. Defaults to utf-8
  * 
  * @returns {Promise.<Object[], Error>}
  */
	readFile(filename, charset = 'utf8') {
		var inputStream = this.fs.createReadStream(filename, charset);
    
		return this.read(inputStream);
  }

  /**
   * Reads a generic stream into an array of transaction objects.
   * @param {ReadableStream} stream the stream from which to read
   * 
   * @returns {Promise.<Object[], Error>}
   */
  read(stream) {

    const CsvReadableStream = require('csv-reader');
		
    const readOptions = { delimiter: ';', skipEmptyLines: true, trim: true };
    
    const reader = CsvReadableStream(readOptions);
		
    return new Promise((resolve, reject) => {
      let rowIndex = 0;
      const rows = [];
      
      // Control variable
      let headerFinished = false;

      stream
        .pipe(reader)
        .on('error', reject)
        .on('data', row => {
          rowIndex++;
          // Skip header rows, they're bogus
          if (headerFinished) {
            // Create a row index
            rows.push(this._toTransactionObject([rowIndex-5].concat(row)));
          }

          if (!headerFinished) {
            headerFinished = this._isHeader(row);
          }
        })
        .on('end', () => resolve(rows));
    });
  }
  
  _toTransactionObject(transactionRow) {
    //const rowIterator = transactionRow[Symbol.iterator]();
    return {
      index: transactionRow[0],
      date: transactionRow[1],
      description: transactionRow[2],
      value: this._moneyToNumber(transactionRow[3]),
      balance: transactionRow[4]
    };
  }

  /**
   * Parses money values in string format to numbers. Takes into consideration
   * negative values.
   * @param {string} moneyString the string to be parsed into number. Ex: "R$ 1.923,98"
   */
  _moneyToNumber(moneyString) {
    const number = (moneyString || '')
      .replace('.', '')
      .match(/\d|\.|\,|\-/gm)
      .join('')
      .replace(',', '.');
    return new Number(number);
  }

  /**
   * Checks if a specific row matches header content.
   * @param {Array} row the row of the CSV to be checked.
   */
  _isHeader(row) {
    const rowText = row instanceof Array ? row.join(';') : row;
    return rowText.indexOf('DATA LAN') > -1
      && rowText.indexOf('AMENTO;HIST') > -1
      && rowText.indexOf('RICO;VALOR;SALDO') > -1;
  }
	
}

module.exports = BankTransactionReader;