var fs = require('fs');
var path = require('path');
var util = require('util');
var DirConfig = require('./config').DirConfig;
var _ = require('underscore');
var _s = require('underscore.string');

var DEFAULT_EXTENSIONS = ['html', 'xml', 'txt'];

function processDirectories(directories, extensions) {
  extensions = extensions || DEFAULT_EXTENSIONS;
  var transformer = new Transformer(extensions);
  directories.forEach(function(directory) {
    transformer.processDirectory(directory);
  });
}

/**
 * Transform directories with a specified output method
 */
function transformDirectories(outputMethod, directories, extensions) {
  extensions = extensions || DEFAULT_EXTENSIONS;
  var transformer = new Transformer(extensions);
  var config = DirConfig.make(outputMethod);
  directories.forEach(function(directory) {
    transformer.transformDirectory(config, directory);
  });
}

var defaultOptions = {
  // List of extensions that need whitespace removed
  removeWhitespaceFor: ['html', 'xml'],
  ignoreDotFiles: true
}

function Transformer(extensions, options) {
  this._extensions = extensions;
  this.options = _.extend({}, defaultOptions, options);
}

/**
 * Recursive directory walker
 */
Transformer.prototype.processDirectory = function(directory) {
  var extensions = this._extensions;
  var files = fs.readdirSync(directory);
  // if we find the config file this is a directory that requires transformation
  if(files.indexOf('txt2js.conf') !== -1) {
    var configPath = path.resolve(directory, 'txt2js.conf');
    var config = DirConfig.load(configPath);
    this.transformDirectory(config, directory);
    return;
  }
  var self = this;
  // Recurse the directories
  files.forEach(function(file) {
    // Skip dot files
    if(self.options.ignoreDotFiles && _s.startsWith(file, '.')) {
      return;
    }
    var childPath = path.resolve(directory, file);
    var stat = fs.statSync(childPath);
    // Recurse if it's a directory
    if(stat.isDirectory()) {
      self.processDirectory(childPath);
    }
  });
};

/**
 * Transforms directory
 */
Transformer.prototype.transformDirectory = function(config, directory, relPath) {
  relPath = relPath || '';
  var extensions = this._extensions;
  var files = fs.readdirSync(directory);
  var self = this;
  files.forEach(function(file) {
    // Skip dot files
    if(self.options.ignoreDotFiles && _s.startsWith(file, '.')) {
      return;
    }
    var childPath = path.join(directory, file);
    var childRelPath = path.join(relPath, file);
    var stat = fs.statSync(childPath);
    // Recurse if it's a directory
    if(stat.isDirectory()) {
      self.transformDirectory(config, childPath, childRelPath);
    } else {
      var splitFilename = file.split('.');
      var extension = splitFilename.slice(-1)[0].toLowerCase();
      // If the extension is in the extensions list then transform it.
      // Otherwise ignore.
      if(extensions.indexOf(extension) !== -1) {
        var transformedText = self.transformFile(config, childPath, childRelPath, file, extension);
        var outputFile = util.format('%s.js', file);
        var outputPath = path.resolve(directory, outputFile);
        fs.writeFileSync(outputPath, transformedText);
      }
    }
  });
};

/**
 * Transforms a file into a javascript file
 */
Transformer.prototype.transformFile = function(config, fullPath, relPath, filename, extension) {
  var contents = fs.readFileSync(fullPath, { encoding: 'utf8' });
  var removeWhitespaceFor = this.options.removeWhitespaceFor;
  var removeWhitespace = false;
  // If it's listed in the option to remove lines for this type then
  // remove lines
  if(removeWhitespaceFor.indexOf(extension) !== -1) {
    removeWhitespace = true;
  }
  var result = '';
  lines = contents.split('\n');
  lines.forEach(function(line) {
    var currentLine = line;
    if(removeWhitespace) {
      currentLine = currentLine.trim();
      currentLine += ' ';
    } else {
      currentLine += "\n";
    }
    result += currentLine;
  });
  // JSON.stringify to make string a javascript literal
  // This will handle any escaping that is necessary
  var resultAsLiteral = JSON.stringify(result);
  return config.processOutput(resultAsLiteral, relPath, filename);
};

exports.processDirectories = processDirectories;
exports.transformDirectories = transformDirectories;
