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
  exportType: 'default',
};

const exportTypes = {
  named(indexModules) {
    return `\n${Object.keys(indexModules).map(name => `export const ${name} = $${name};`).join('\n')}\n`;
  },
  default(indexModules, indent) {
    return `\nexport default {\n${indent}${Object.keys(indexModules).map(name => `'${name}': $${name},`).join(`\n${indent}`)}\n};`
  },
  global(indexModules) {
    return `\nconst context = typeof window === 'undefined' ? (typeof global === 'undefined' ? this : global) : window;` +
    `\n${Object.keys(indexModules).map(name => `context['${name}']= $${name};`).join('\n')}\n`;
  }
};

module.exports = function (options) {
  const { context, filename, exclude, indentSize, exportType } = Object.assign({}, defaultOptions, options || {});

  if (!(exportType in exportTypes)) {
    throw new Error(`Unknown export type '${exportType}' can be: ${Object.keys(exportTypes)}`);
  }

  const indexModules = {};

  return Through.obj((file, enc, cb) => {
    const source = file.history[file.history.length - 1];
    const relativePath = Path.relative(context, source);
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
      const relativeFilename = Path.relative(context, source).replace(delimiterPathExpr, '/').replace(/\.[^.]+$/, '');
      const moduleName = namespace.join('');
      indexModules[moduleName] = relativeFilename;
    }

    cb(null, file);
  }, cb => {
    const indent = ' '.repeat(indentSize);
    const indexFile = Object.keys(indexModules).map(m => `import ${importing(m)} from './${indexModules[m]}';`);

    indexFile.push(exportTypes[exportType](indexModules, indent));

    const exportFile = new File({
      path: filename,
      contents: Buffer.from(indexFile.join('\n'))
    });
    cb(null, exportFile);
  });
};
