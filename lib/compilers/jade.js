var jadeCompiler = require('jade-compiler');
var options = require('../options');

module.exports = function (source, cb) {
    jadeCompiler.fromSource(source, options.jade, cb);
};