var util = require('util');
var path = require('path');
var hash = require('hash-sum');
var parse5 = require('parse5');
var deIndent = require('de-indent');
var Emitter = require('events').EventEmitter;

// Build-in compolers
var compilers = {
    less: require('./compilers/less'),
    sass: require('./compilers/sass'),
    stylus: require('./compilers/stylus'),
    babel: require('./compilers/babel'),
    pug: require('./compilers/pug')
};

// Build-in config
var options = require('./options');

// Source code rewriters
var autoprefixer = require('./rewriters/autoprefixer');
var cssminifier = require('./rewriters/cssminifier');
var htmlminifier = require('./rewriters/htmlminifier');
var cssscoped = require('./rewriters/cssscoped');
var htmlscoped = require('./rewriters/htmlscoped');
var component = require('./rewriters/component');

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
 * @param {String} file path
 * @return {Promise}
 */
function compileAsPromise (type, source, lang, filePath) {
    return new Promise(function (resolve, reject) {
        var compiler = compilers[lang];

        // build-in lang
        if (util.isFunction(compiler)) {
            compiler(source, function (err, target) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        type: type,
                        source: target
                    });
                }
            }, filePath);

        // unknow lang
        } else {
            resolve({
                type: type,
                source: source
            });
        }
    });
}

/**
 * Process template node
 */
function processTemplate (node, scopeId, filePath) {
    var lang = getAttribute(node, 'lang');
    var source = deIndent(parse5.serialize(node.content));

    return compileAsPromise(TYPE_TEMPLATE, source, lang, filePath)
        .then(htmlscoped(scopeId, isScoped(node)))
        .then(htmlminifier);
}

/**
 * Process style node
 */
function processStyle (node, scopeId, filePath) {
    var lang = getAttribute(node, 'lang');
    var source = deIndent(parse5.serialize(node));

    return compileAsPromise(TYPE_STYLE, source, lang, filePath)
        .then(cssscoped(scopeId, isScoped(node)))
        .then(autoprefixer)
        .then(cssminifier);
}

/**
 * Process script node
 */
function processScript (node, filePath) {
    var lang = getAttribute(node, 'lang');
    var source = deIndent(parse5.serialize(node));

    return compileAsPromise(TYPE_SCRIPT, source, lang, filePath);
}

var currentName = '';
var currentStamp = null;
var compiler = new Emitter();

/**
 * Apply compiler config
 *
 * @param {String}
 * @param {Object}
 */
compiler.config = function (key, value) {
    if (options.hasOwnProperty(key)) {
        Object.assign(options[key], value || {});
    }
};

/**
 * Compile .ko file
 *
 * @param {String} file
 * @param {String} path
 * @param {Function} callback
 */
compiler.compile = function (file, filePath, cb) {
    if (util.isFunction(filePath)) {
        cb = filePath;
        filePath = '';
    }

    // parse .ko file content into html fragment
    var fragment = parse5.parseFragment(file, { locationInfo: true });
    var scopeId = '_k-' + hash(file);

    // cache current component name
    currentName = path.parse(filePath).name;

    // only one template node is aceepted
    if (!validateNodeCount(fragment)) {
        cb(new Error(errors.multiple_template_node));
    }

    compiler.start();

    Promise.all(fragment.childNodes.map(function (node) {
        switch (node.nodeName.toLowerCase()) {
            case 'template':
                return processTemplate(node, scopeId, filePath);
            case 'style':
                return processStyle(node, scopeId, filePath);
            case 'script':
                return processScript(node, filePath);
        }
    }))
    .then(compiler.merge)
    .then(compiler.transpile)
    .then(function (script) {
        cb(null, script);
        compiler.end();
    })
    .catch(cb);

};

compiler.merge = function (bundles) {

    // merge source according to fragment type
    function mergeSource (bundles) {
        var style = extarctSource(bundles, TYPE_STYLE);
        var script = extarctSource(bundles, TYPE_SCRIPT);
        var template = extarctSource(bundles, TYPE_TEMPLATE);
        var sourceList = [
            'import \'robust-mixin\';',
            'import _ko_component_mixin from \'robust-mixin\';',
            'import _ko_component_insert_css from \'insert-css\';',
            'export var _ko_component_name = \'' + currentName + '\';',
            'export var _ko_component_style = `' + style + '`;',
            'export var _ko_component_template = `' + template + '`;',
            script,
            '_ko_component_insert_css(_ko_component_style);'
        ];

        if (!script || !/export default/mg.test(script)) {
            sourceList.push('export default { constructor: function () {} }');
        }

        return sourceList.join('\n');
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

    return new Promise(function (resolve, reject) {
        resolve(mergeSource(bundles))
    });
};

compiler.transpile = function (script) {
    if (!script) {
        script = 'export default function constructor () {};';
    }

    return component(script);
};

compiler.start = function () {
    currentStamp = Date.now();
};

compiler.end = function () {
    var cost = Date.now() - currentStamp;

    console.log(
        'Compile ' + currentName + ' cost ' + cost + ' ms.'
    );
};

module.exports = compiler;
module.exports.processStyle = processStyle;
module.exports.processScript = processScript;
module.exports.processTemplate = processTemplate;
