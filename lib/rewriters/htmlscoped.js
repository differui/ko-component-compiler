var parse5 = require('parse5');
var currentId = '';

// add scope attribute on node
function htmlScoped (node) {
    if (node.attrs) {
        node.attrs.push({
            name: currentId,
            value: ''
        });
    }
}

// walk dom tree
function walk (node, handler) {
    if (node.tagName) {
        handler(node);
    }

    if (node.childNodes) {
        node.childNodes.forEach(function (childNode) {
            walk(childNode, handler);
        });
    }
}

module.exports = function (id, scoped) {
    currentId = id;

    return function (bundle) {
        return new Promise(function (resolve, reject) {
            var ast = parse5.parseFragment(bundle.source);

            if (scoped) {
                walk(ast, htmlScoped);
            }

            resolve({
                type: bundle.type,
                source: parse5.serialize(ast)
            });
        });
    };
};
