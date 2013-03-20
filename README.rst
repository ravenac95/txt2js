txt2js - Text file to Javascript string
=======================================

Converts text files to javascript strings.

It searches for directories containing a ``txt2js.conf`` file. Any directories
that contain this file will be processed for text files to export into
javascript strings. The config file is a javascript file containing at least a
single export ``output`` which is a callback used to process the output from a
txt2js conversion.

Here's a simple example::

    var util = require('util');
    
    exports.output = function(string, relPath, fileName) {
      var output = '';
      output += util.format('files[%s] = %s;', relPath, string);
      return output;
    }

This would add any file into the object ``files`` using the relPath as it's
key.
