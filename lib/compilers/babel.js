var babelCore = require('babel-core');
var options = require('../options');

module.exports = function (source, cb) {
    var res = null;

    try {
        res = babelCore.transform(source, options.babel);
    } catch (err) {
        cb(err);
    }

    cb(null, res.code);
};
