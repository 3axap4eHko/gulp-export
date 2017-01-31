/*! Gulp Export Plugin v2.1.0 | Copyright (c) 2015-present Ivan (3axap4eHko) Zakharchenko*/
'use strict';

const Path = require('path');
const Through = require('through2');
const File = require('vinyl');

const delimiterPathExpr = /\\|\//g;
const lowercaseExpr = /^[a-z]/;
const invalidCharsExpr = /[-.,]/;

function toUpperCaseFirst(str) {
  if (!str.length) {
    return str;
  }
  return str[0].toUpperCase() + str.slice(1);
}
function toValidName(str) {
  return str.split(invalidCharsExpr).map(toUpperCaseFirst).join('')
}
function toLowerCaseFirst(str) {
  if (!str.length) {
    return str;
  }
  return str[0].toLowerCase() + str.slice(1);
}
function importing(moduleName) {
  if (lowercaseExpr.test(moduleName)) {
    return `* as $${moduleName}`;
  }
  return `$${moduleName}`;
}
const defaultOptions = {
  context: './',
  filename: 'index.js',
  exclude: /^$/,
  indentSize: 2,
};

module.exports = function (options) {
  options = Object.assign({}, defaultOptions, options || {});

  const indexModules = {};
  const exportFileName = options.filename || packageJson.main;
  const {exclude, indentSize} = options;

  return Through.obj((file, enc, cb) => {
    const fileName = file.history[file.history.length - 1];
    const relativePath = Path.relative(options.context, fileName);
    console.log(exclude);
    console.log(relativePath);
    console.log(exclude.test(relativePath));
    if (!exclude.test(relativePath)) {
      const parsedPath = Path.parse(relativePath);
      const isClass = !lowercaseExpr.test(parsedPath.name);
      const namespace = parsedPath.dir
        .split(delimiterPathExpr)
        .filter(part => part.length)
        .concat([parsedPath.name])
        .map(toValidName)
        .map(toUpperCaseFirst);

      if (!isClass) {
        namespace[0] = toLowerCaseFirst(namespace[0]);
      }
      const relativeFilename = Path.relative(options.context, fileName).replace(delimiterPathExpr, '/').replace(/\.[^.]+$/, '');
      const moduleName = namespace.join('');
      indexModules[moduleName] = relativeFilename;
    }

    cb(null, file);
  }, cb => {
    const indent = ' '.repeat(indentSize);
    const indexFile = Object.keys(indexModules).map(m => `import ${importing(m)} from './${indexModules[m]}';`);

    indexFile.push(`\nexport default {\n${indent}${Object.keys(indexModules).map(name => `'${name}': $${name}`).join(`,\n${indent}`)},`);
    indexFile.push('};');

    const exportFile = new File({
      path: exportFileName,
      contents: Buffer.from(indexFile.join('\n'))
    });
    cb(null, exportFile);
  });
};
