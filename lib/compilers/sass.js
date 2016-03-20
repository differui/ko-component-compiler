var nodeSass = require('node-sass');
var options = require('../options');

module.exports = function (source, cb) {
    nodeSass.render(Object.assign({
        data: source
    }, options.sass), function (err, res) {
        if (err) {
            cb(err);
        } else {
            cb(null, res.css.toString());
        }
    });
};