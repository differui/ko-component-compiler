var babel = require('babel-core');
var flatten = require('babel-plugin-ko-component-flatten');
var register = require('babel-plugin-ko-component-register');

module.exports = function (script) {
    return new Promise(function (resolve, reject) {
        try {
            script = babel.transform(script, { plugins: flatten }).code;
            script = babel.transform(script, { plugins: register }).code;
            resolve(script);
        } catch (err) {
            reject(err);
        }
    });
};