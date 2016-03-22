var CleanCss = require('clean-css');
var options = require('../options');

module.exports = function (bundle) {
    return new Promise(function (resolve, reject) {
        new CleanCss(options.cssMinify).minify(bundle.source, function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    type: bundle.type,
                    source: res.styles
                });
            }
        });
    })
}