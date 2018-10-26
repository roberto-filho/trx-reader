const BusboyConfigurator = require('./conf/BusboyConfigurator');
const Application = require('./Application');
const ResourceConfigurator = require('./conf/ResourceConfigurator');

const express = require('express');
const app = express();
const cors = require('cors');
const settings = Application.getCurrentSettings();

const port = settings.port;

// Setup cors
let corsOptions = {
  origin: settings.corsAddress,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

const configurator = new BusboyConfigurator();

ResourceConfigurator.configureResources(app, configurator);

app.listen(port, () => console.log(`App listening on port ${port}!`));