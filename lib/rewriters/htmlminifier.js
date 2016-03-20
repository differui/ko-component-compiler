var minify = require('html-minifier').minify;
var options = require('../options');

module.exports = function (bundle) {
    return new Promise(function (reslove, reject) {
        try {
            reslove({
                type: bundle.type,
                source: minify(bundle.source, options.htmlMinify)
            });
        } catch (e) {
            reject(e);
        }
    });
};