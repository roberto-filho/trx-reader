const BankResource = require('./resources/BankResource');

const express = require('express');
const app = express();

const resource = new BankResource();

// Call the register paths
resource.registerPaths(app);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App listening on port ${port}!`));