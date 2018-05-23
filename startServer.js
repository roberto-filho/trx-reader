const BankResource = require('./resources/BankResource');

const express = require('express');
const app = express();
const cors = require('cors');

// Read env variables
const port = process.env['PORT'] || 3000;
const corsAddress = process.env['CORS'] || 'http://localhost:3000';

// Setup cors
var corsOptions = {
  origin: corsAddress,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

const resource = new BankResource();

// Call the register paths
resource.registerPaths(app);

app.listen(port, () => console.log(`App listening on port ${port}!`));