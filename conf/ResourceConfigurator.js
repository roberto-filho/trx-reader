const UploadResource = require('../resources/UploadResource');
const CategoriesResource = require('../resources/CategoriesResource');
const UploadedHeadersResource = require('../resources/UploadedHeadersResource');

function registerResourcesToApp(app) {
  const resources = [];
  resources.push(new UploadResource());
  resources.push(new CategoriesResource());
  resources.push(new UploadedHeadersResource());

  // Call the register paths
  resources.forEach(resource => {
    resource.registerPaths(app);
  });
}

module.exports = class ResourceConfigurator {

  /**
   * Configures the resources
   * @param {Object} app the express app
   * @param {Object} configurator the busboy configurator
   */
  static configureResources(app, configurator) {
    // Register busboy for paths
    configurator.addUploadPath('/api/bank/upload');
    configurator.addUploadPath('/api/bank/categorize');
    configurator.configure(app);

    registerResourcesToApp(app);
  }

}

