module.exports = class BankFileHeaderReader {
  
  constructor () {
    // this.fs = require('fs');
  }

  readFileHeader(filePath) {
    return new Promise((resolve, reject) => {
      const iface = this._getReadfileInterface(filePath);
  
      let lineNumber = 1;
      let headerInfo = {};
      
      iface.on('line', line => {
        if (lineNumber > 4) {
          // Close everything, we're done
          iface.close();
        } else {
          this._readHeaderPropertiesFromLine(line, headerInfo);
        }
        lineNumber++;
      })
      .on('close', function () {
        if(lineNumber < 5) {
          reject(new Error('Did not reach end of header.'));
        } else {
          // Everything ok
          resolve(headerInfo);
        }
      });
    });
  }

  _getReadfileInterface(filePath) {
    const readline = require('readline');
    const fs = require('fs');
      
    const iface = readline.createInterface({
      input: fs.createReadStream(filePath)
    });

    return iface;
  }

  /**
   * Converts a date string in brazilian format (dd/mm/yyyy) to
   * international format (mm/dd/yyyy).
   * @param {string} dateString the string containing the date info in
   * brazilian format. Ex: "31/10/2018"
   * @returns the date string in international format.
   */
  _toUSDate(dateString) {
    const dateNumbers = dateString.match(/(\d{2,4})+/g);
    return `${dateNumbers[1]}/${dateNumbers[0]}/${dateNumbers[2]}`;
  }

  /**
   * Reads header info from a line of the file.
   * @param {string} lineString the line to read the info from
   * @param {object} header the object that contains the header info
   */
  _readHeaderPropertiesFromLine(lineString, header) {
    if (lineString.includes('Conta')) {
      // é a linha que contém a conta, extrair o número da conta
      header.accountNumber = lineString.replace(/\D/gm, '');
    }
    if (lineString.startsWith('Per') && lineString.includes('odo')) { // Contains "período"
      // é a linha que contém as datas
      const dates = lineString.match(/([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}/gm);
      if(dates.length == 2) {
        header.startDate = this._toUSDate(dates[0]);
        header.endDate = this._toUSDate(dates[1]);
      }
    }
  }
}
