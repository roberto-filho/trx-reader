const UploadResource = require('./resources/UploadResource');
const CategoriesResource = require('./resources/CategoriesResource');
const BusboyConfigurator = require('./conf/BusboyConfigurator');

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

const configurator = new BusboyConfigurator();

// Register busboy for paths
configurator.addUploadPath('/api/bank/upload');
configurator.addUploadPath('/api/bank/categorize');
configurator.configure(app);

const resources = [];
resources.push(new UploadResource());
resources.push(new CategoriesResource());

// Call the register paths
resources.forEach(resource => {
  resource.registerPaths(app);
});

app.listen(port, () => console.log(`App listening on port ${port}!`));