var stylusCompiler = require('stylus-compiler');
var options = require('../options');

module.exports = function (source, cb) {
    stylusCompiler.fromSource(source, options.stylus, cb);
};