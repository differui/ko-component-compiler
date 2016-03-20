var util = require('util');
var hash = require('hash-sum');
var parse5 = require('parse5');
var deIndent = require('de-indent');
var Emitter = require('events').EventEmitter;

// Build-in compolers
var compilers = {
    jade: require('./compilers/jade'),
    less: require('./compilers/less'),
    sass: require('./compilers/sass'),
    stylus: require('./compilers/stylus'),
    babel: require('./compilers/babel')
};

// Source code rewriters
var autoprefixer = require('./rewriters/autoprefixer');
var cssminifier = require('./rewriters/cssminifier');
var htmlminifier = require('./rewriters/htmlminifier');
var cssscoped = require('./rewriters/cssscoped');
var htmlscoped = require('./rewriters/htmlscoped');

// Node types
var TYPE_STYLE = 'style';
var TYPE_SCRIPT = 'script';
var TYPE_TEMPLATE = 'template';

// Errors
var errors = {
    multiple_template_node: 'More than one template node.'
};

/**
 * Ensure there's only one template node.
 *
 * @param {Fragment} fragment
 * @return {Boolean}
 */

function validateNodeCount (fragment) {
    var count = 0;

    fragment.childNodes.forEach(function (node) {
        if (node.nodeName === 'template') {
            count++
        }
    });

    return count <= 1
}

/**
 * Check if style node with scoped attribute
 *
 * @param {Node}
 */
function isScoped (node) {
    return node.attrs && node.attrs.some(function (attr) {
        return attr.name === 'scoped'
    });
}

/**
 * Get attribute value on specific node
 *
 * @param {Object} node
 * @param {String} attribute name
 */
function getAttribute (node, name) {
    var i = 0;
    var attr = null;

    if (node.attrs) {
        i = node.attrs.length;
        while (i--) {
            attr = node.attrs[i]
            if (attr.name === name) {
                return attr.value
            }
        }
    }
}

/**
 * Compile a piece of source code and return a promise back
 *
 * @param {String} node type
 * @param {String} source code
 * @param {String} source lang
 * @return {Promise}
 */
function compileAsPromise (type, source, lang) {
    return new Promise(function (reslove, reject) {
        var compiler = compilers[lang];

        // build-in lang
        if (util.isFunction(compiler)) {
            compiler(source, function (err, target) {
                if (err) {
                    reject(err);
                } else {
                    reslove({
                        type: type,
                        source: target
                    });
                }
            });

        // unknow lang
        } else {
            reslove({
                type: type,
                source: source
            });
        }
    });
}

/**
 * Process template node
 */
function processTemplate (node, id) {
    var lang = getAttribute(node, 'lang');
    var source = deIndent(parse5.serialize(node.content));

    return compileAsPromise(TYPE_TEMPLATE, source, lang)
        .then(htmlscoped(id, isScoped(node)))
        .then(htmlminifier);
}

/**
 * Process style node
 */
function processStyle (node, id) {
    var lang = getAttribute(node, 'lang');
    var source = deIndent(parse5.serialize(node));

    return compileAsPromise(TYPE_STYLE, source, lang)
        .then(cssscoped(id, isScoped(node)))
        .then(autoprefixer)
        .then(cssminifier);
}

/**
 * Process script node
 */
function processScript (node) {
    var lang = getAttribute(node, 'lang');
    var source = deIndent(parse5.serialize(node));

    return compileAsPromise(TYPE_SCRIPT, source, lang);
}

var compiler = new Emitter();

/**
 * Compile .ko file
 *
 * @param {String} content
 * @param {String} file path
 * @param {Function} callback
 */
compiler.compile = function (file, path, cb) {

    // parse .ko file content into html fragment
    var fragment = parse5.parseFragment(file, { locationInfo: true });
    var id = '_k-' + hash(path || file);

    // only one template node is aceepted
    if (!validateNodeCount(fragment)) {
        cb(new Error(errors.multiple_template_node));
    }

    Promise.all(fragment.childNodes.map(function (node) {
        switch (node.nodeName.toLowerCase()) {
            case 'template':
                return processTemplate(node, id);
            case 'style':
                return processStyle(node, id);
            case 'script':
                return processScript(node);
        }
    }))
    .then(function (bundles) {
        cb(null, mergeSource(bundles));
    })
    .catch(cb);

    // merge source according to fragment type
    function mergeSource (bundles) {
        return {
            style: extarctSource(bundles, TYPE_STYLE),
            script: extarctSource(bundles, TYPE_SCRIPT),
            template: extarctSource(bundles, TYPE_TEMPLATE)
        };
    }

    // extract soruce code as given type
    function extarctSource (bundles, type) {
        var sourceList = [];

        bundles.forEach(function (bundle) {
            if (bundle && bundle.type === type) {
                sourceList.push(bundle.source);
            }
        });

        return sourceList.join('\n');
    }
};

module.exports = compiler;