var lessOptions = {};
var jadeOptions = {
    pretty: true
};
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
var babelOptions = {
    presets: [ 'es2015' ],
    plugins: [ 'transform-runtime' ]
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