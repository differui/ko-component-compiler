var lessOptions = {};
var babelOptions = {};
var sassOptions = {};
var stylusOptions = {};
var cssMinifyOptions = {};
var htmlMinifyOptions = {
    collapseWhitespace: true,
    removeComments: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeRedundantAttributes: false,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true
};
var pugOptions = {
    pretty: true
};

module.exports = {
    less: lessOptions,
    sass: sassOptions,
    stylus: stylusOptions,
    babel: babelOptions,
    cssMinify: cssMinifyOptions,
    htmlMinify: htmlMinifyOptions,
    pug: pugOptions
};
