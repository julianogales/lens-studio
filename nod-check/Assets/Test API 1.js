// @input Asset.RemoteServiceModule remoteServiceModule

// Import module
const Module = require("./Test API Module");
const ApiModule = new Module.ApiModule(script.remoteServiceModule);

// Access functions defined in ApiModule like this:
//ApiModule.(function name)
