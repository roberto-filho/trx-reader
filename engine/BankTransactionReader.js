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
      
      stream
        .pipe(reader)
        .on('error', reject)
        .on('data', row => {
          rowIndex++;
          // Skip first five rows, they're bogus
          if (rowIndex > 5) {
            // Create a row index
            rows.push(this._toTransactionObject([rowIndex-5].concat(row)));
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
      value: transactionRow[3],
      balance: transactionRow[4]
    };
  }
	
}

module.exports = BankTransactionReader;