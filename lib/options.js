var lessOptions = {};
var jadeOptions = {
    pretty: true
};
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

module.exports = {
    less: lessOptions,
    jade: jadeOptions,
    sass: sassOptions,
    stylus: stylusOptions,
    babel: babelOptions,
    cssMinify: cssMinifyOptions,
    htmlMinify: htmlMinifyOptions
};