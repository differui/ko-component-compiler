var lessCompiler = require('less-compiler');
var options = require('../options');

module.exports = function (source, cb) {
    lessCompiler.fromSource(source, options.less, cb);
};