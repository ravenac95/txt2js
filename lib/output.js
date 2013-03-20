var util = require('util');

/**
 * Included output functions that can be imported into txt2js.conf files
 */
module.exports = {
  /**
   * Extend an object
   *
   * @param {String} varName the variable name for the object
   *
   * @returns {Function} The output function
   */
  extendAnObject: function(varName) {
    return function(string, relPath, filename) {
      return util.format('%s["%s"] = %s;', varName, relPath, string);
    }
  },
  /**
   * Like extendAnObject but adds the variable to the ``this`` object
   *
   * Do not call this directly.
   */
  addToLocalContext: function(string, relPath, filename) {
    return util.format('this["%s"] = %s;', varName, relPath, string);
  }
};
