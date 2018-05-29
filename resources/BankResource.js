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
      });
  }

  _getFileHeader(filePath) {
    return new Promise((resolve, reject) => {
      const readline = require('readline');
      
      const iface = readline.createInterface({
        input: fs.createReadStream(filePath)
      });
  
      let lineNumber = 1;
      let headerInfo = {};
      iface.on('line', line => {
        if (lineNumber > 4) {
          // Close everything, we're done
          iface.close();
        } else {
          if (line.includes('Conta')) {
            // é a linha que contém a conta, extrair o número da conta
            headerInfo.accountNumber = line.replace(/\D/gm, '');
          }
          if (line.startsWith('Per') && line.includes('odo')) { // Contains "período"
            // é a linha que contém as datas
            const dates = line.match(/([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}/gm);
            if(dates.length == 2) {
              headerInfo.startDate = this._toUSDate(dates[0]);
              headerInfo.endDate = this._toUSDate(dates[1]);
            }
          }
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

  _toUSDate(dateString) {
    const dateNumbers = dateString.match(/(\d{2,4})+/g);
    return `${dateNumbers[1]}/${dateNumbers[0]}/${dateNumbers[2]}`;
  }

}

module.exports = BankResource;