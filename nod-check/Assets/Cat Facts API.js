// @input Asset.RemoteServiceModule remoteServiceModule

// Import module
const Module = require("./Cat Facts API Module");
const ApiModule = new Module.ApiModule(script.remoteServiceModule);

// Access functions defined in ApiModule like this:
//ApiModule.(function name)
