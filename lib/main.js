var path = require('path');
var _ = require('underscore');
var program = require('commander');
var transform = require('./transform');
var outputFunctions = require('./output');

function list(val) {
  return val.split(',')
}

function run() {
  program
    .version('0.0.1')
    .usage('[options] <start-directory>')
    .option('-e, --extensions', 'Specify extensions to tranform', list)
    .parse(process.argv)
  var directories = _.map(program.args, function(directory) {
    return path.resolve(directory);
  });
  if(directories) {
    transform.processDirectories(program.args, program.extensions);
  }
}

exports.run = run;
exports.outputs = outputFunctions;
