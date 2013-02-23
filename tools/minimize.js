
/*
 * Environment: node / uglify-js(version >=2.2.5)
 */
var fs = require('fs');

var licence = '/* @license The MIT License, @author Li Chang Wei <lichangwei@love.com>, @see https://github.com/lichangwei/domtemp */\n';

var sources = [
  '../src/domtemp.js',
  '../src/attr-scanner.js',
  '../src/form-scanner.js',
  '../src/loop-scanner.js'
];
var options = {
  outSourceMap: 'domtemp-min.js.map',
  sourceRoot: 'tools'
};

var output = require('uglify-js').minify(sources, options);

var compressed = licence +
  output.code + '\n' +
  '//@ sourceMappingURL=' + options.outSourceMap;

fs.writeFileSync('../domtemp-min.js', compressed);
fs.writeFileSync('../' + options.outSourceMap, output.map);
