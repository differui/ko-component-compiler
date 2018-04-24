var pug = require('pug');
var options = require('../options');

module.exports = function (source, cb) {
    pug.render(source, options.pug, cb);
};
