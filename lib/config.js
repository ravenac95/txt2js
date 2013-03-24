var fs = require('fs');
var path = require('path');
var vm = require('vm');
var outputMethods = require('./output');

function DirConfig(filePath) {
  this._filePath = filePath;
  this._config = {};
}

DirConfig.load = function(filePath) {
  var config = new DirConfig(filePath);
  config.load();
  return config;
};

DirConfig.make = function(outputMethod) {
  var config = new DirConfig();
  config.setOutputMethod(outputMethod);
  return config;
}

DirConfig.prototype.load = function() {
  var filePath = this._filePath;
  var configEnv = {
    // access to globals
    console: console,
    require: require,
    process: process,
    exports: {},
    __filename: filePath,
    __dirname: path.dirname(filePath)
  };
  try {
    var configSrc = fs.readFileSync(filePath);
    vm.runInNewContext(configSrc, configEnv);
  } catch(e) {
    if(e.name === 'SyntaxError') {
      console.log('Syntax error in config file!\n' + e.message);
    } else if(e.code === 'ENOENT' || e.code === 'EISDIR') {
      console.log('Config file does not exist!\n');
    } else {
      console.log('Invalid config file\n', e);
    }

    process.exit(1);
  }
  this._config = configEnv.exports;
};

DirConfig.prototype.setOutputMethod = function(method) {
  this._config.output = outputMethods[method];
  if(!this._config.output) {
    throw new Error(util.format('Output method "%s" does not exist', method));
  }
}

DirConfig.prototype.processOutput = function() {
  return this._config.output.apply(null, arguments);
};

exports.DirConfig = DirConfig;
