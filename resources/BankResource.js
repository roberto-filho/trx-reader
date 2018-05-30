const fs = require('fs');

class BankResource {

  registerPaths(express) {
    this._setupBusboy(express);

    express.post('/api/bank/upload', this.uploadFile);
  }

  _setupBusboy(expressApp) {
    // Express busboy for parsing uploads.
    var expBusboy = require('express-busboy');
    expBusboy.extend(expressApp, {
      upload: true,
      allowedPath: /^\/api\/bank\/upload$/
    });
  }

  /**
   * Upload a file
   * @param {object} request the request
   * @param {object} response the response
   */
  uploadFile(req, res) {

    const BankTransactionReader = require('../engine/BankTransactionReader');

    const trxReader = new BankTransactionReader();

    if (Object.keys(req.files).length === 0) {
      // There is no file upload, throw error
      res.status(422).json({error: 'No file to upload.'}).end();
    } else {
      // Parse only first file
      const firstFileKey = Object.keys(req.files)[0];
      const firstFile = req.files[firstFileKey];
      const firstFilePath = firstFile.file;

      console.log(`Handling request file: ${firstFilePath}`);

      this._saveFileHeader(firstFilePath)
        .then(() => {
          trxReader.readFile(firstFilePath)
            .then(transactions => {
              // Delete file after done with it
              fs.unlink(firstFilePath, (err) => {
                if (err) {
                  console.error(`Error deleting file [${firstFilePath}]: ${err}`);
                }
              });
    
              // const DatabaseService = require('../database/DatabaseService');
    
              // DatabaseService.listAllCategories()
              //   .then((categories) => {
              //     const BankTransactionCategorizer = require('../engine/BankTransactionCategorizer');
              //     const categorizer = new BankTransactionCategorizer();
                  
              //     const categorized = categorizer.categorize(transactions, categories);
    
              //     res.json(categorized).end();
              //   });
    
              res.json(transactions).end();
            })
            .catch((err) => {
              res.status(500).json(err).end();
            });
        });
      
    }
  }

  _saveFileHeader(filePath) {
    return this._getFileHeader(filePath)
      .then(header => {
        // Save header to database
        // console.log(JSON.stringify(header));
        const DatabaseService = require('../database/DatabaseService');
        return DatabaseService.insertObject('uploadedHeaders', header);
      });
  }

  _getReadfileInterface(filePath) {
    const readline = require('readline');
      
    const iface = readline.createInterface({
      input: fs.createReadStream(filePath)
    });

    return iface;
  }

  _getFileHeader(filePath) {
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
          reject('Did not reach end of header.');
        } else {
          // Everything ok
          resolve(headerInfo);
        }
      });
    });
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

module.exports = BankResource;