var postcss = require('postcss');

module.exports = function (bundle) {
    return postcss([
        require('autoprefixer')
    ])
    .process(bundle.source)
    .then(function (res) {
        return {
            type: bundle.type,
            source: res.css
        };
    });
};