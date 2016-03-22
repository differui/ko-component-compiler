var postcss = require('postcss');
var options = require('../options');
var selectorParser = require('postcss-selector-parser');
var currentId = '';

// post css add attribute selector plugin
var cssScoped = postcss.plugin('css-scoped', function () {
    return function (roots) {
        roots.each(function rewriteSelector (root) {
            if (!root.selector) {

                // handle media queries
                if (root.type === 'atrule' && root.name === 'media') {
                    root.each(rewriteSelector);
                }

                return;
            }

            root.selector = selectorParser(function (selectorBundle) {
                selectorBundle.each(function (selectorList) {
                    var lastSelector = null;

                    selectorList.each(function (selector) {
                        if (selector.type !== 'pseudo') {
                            lastSelector = selector
                        }
                    });

                    selectorList.insertAfter(lastSelector, selectorParser.attribute({
                        attribute: currentId
                    }));
                });
            }).process(root.selector).result;
        })
    };
});

module.exports = function (id, scoped) {
    var plugins = [];

    if (scoped) {
        plugins.push(cssScoped);
    }

    currentId = id;

    return function (bundle) {
        return postcss(plugins)
            .process(bundle.source)
            .then(function (res) {
                return {
                    type: bundle.type,
                    source: res.css
                };
            });
    };
};
