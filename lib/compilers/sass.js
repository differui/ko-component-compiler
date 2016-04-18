var path = require('path');
var nodeSass = require('node-sass');
var options = require('../options');

module.exports = function (source, cb, filePath) {
    const defaultIncludePaths = [
        path.dirname(filePath),
        process.cwd()
    ];
    const sassOptions = Object.assign({
        data: source
    }, options.sass);

    sassOptions.includePaths = options.includePaths ?
        defaultIncludePaths.concat(options.includePaths) : defaultIncludePaths;

    nodeSass.render(sassOptions, function (err, res) {
        if (err) {
            cb(err);
        } else {
            cb(null, res.css.toString());
        }
    });
};
