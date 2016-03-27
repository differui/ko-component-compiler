Knockout Component Compiler
=====

## What is Knockout Component?

+ Let you write component in single file just like vue component.
+ Easy to write a component and no need to care about register.

```
<template>
    <div class="btn">
        <icon k-name="icon" class="btn-icon"></icon>
        <span data-bind="text: text" class="btn-text"></span>
    </div>
</template>

<style scoped>
    .btn {
        /* btn style goes here */
    }
</style>

<script>
    export default {
        constructor: function (opts, info) {
            this.text = ko.observable(opts.text);
            this.icon = ko.observable(opts.icon);
        },

        defaults: {
            text: 'Button'
        },

        mixins: [],

        methods: {}
    };
</script>
```

## API

```js
var compiler = require('ko-component-compiler');

compiler.compile('code', function (err, result) {

    // component style template and script wrapped as single file
    console.log(result);
});
```

## Rollup.js

Install packages:

```bash
# rollup plugins
$ npm install rollup-plugin-ko
$ npm install rollup-plugin-babel
$ npm install rollup-plugin-commonjs
$ npm install rollup-plugin-node-resolve

# peer deps
$ npm install inject-css
$ npm install robust-mixin
```

```js
var fs = require('fs');
var rollup = require('rollup');
var ko = require('rollup-plugin-ko');
var babel = require('rollup-plugin-babel');
var commonjs = require('rollup-plugin-commonjs');
var nodeResolve = require('rollup-plugin-node-resolve');

rollup.rollup({
    entry: './src/main.js',
    plugins: [
        nodeResolve({ jsnext: true, main: true }),
        commonjs(),
        ko(),
        babel({
            presets: [
                'es2015-rollup'
            ]
        })
    ]
})
.then(function (bundle) {
    var result = bundle.generate({
        format: 'iife'
    });

    fs.writeFileSync( './dest/app.js', result.code );
})
.catch(function (err) {
    console.log(err);
});
```
