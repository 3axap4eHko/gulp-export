/*! Gulp Export Plugin v0.1.1 | Copyright (c) 2015 Ivan (3axap4eHko) Zakharchenko*/
'use strict';

const Fs = require('fs');
const Path = require('path');
const Through = require('through2');
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
    if(lowercaseExpr.test(moduleName)) {
        return `* as _${moduleName}`;
    }
    return moduleName;
}
const defaultOptions = {
    context: './'
};

module.exports = function(options) {
    options = Object.assign({}, defaultOptions, options || {});

    const indexModules = {};
    const packageJson = JSON.parse(Fs.readFileSync(Path.join(process.cwd(), 'package.json')));

    return Through.obj( (file, enc, cb) => {
        const fileName = file.history[file.history.length-1];
        const relativePath = Path.relative(options.context, fileName);
        const parsedPath = Path.parse(relativePath);
        const isClass = !lowercaseExpr.test(parsedPath.name);
        const namespace = parsedPath.dir
            .split(delimiterPathExpr)
            .filter( part => part.length)
            .concat([parsedPath.name])
            .map(toValidName)
            .map(toUpperCaseFirst);

        if (!isClass) {
            namespace[0] = toLowerCaseFirst(namespace[0]);
        }
        const relativeFilename = Path.relative(options.context, fileName).replace(delimiterPathExpr, '/').replace(/\.[^.]+$/,'');
        const moduleName = namespace.join('');
        indexModules[moduleName]=relativeFilename;
        cb(null, file);
    }, cb => {
        const exportFileName = options.filename || packageJson.main;
        const indexFile = Object.keys(indexModules).map( m => `import ${importing(m)} from './${indexModules[m]}';`);
        indexFile.push(`export default {\n    ${Object.keys(indexModules).map( name => `'${name}': _${name}` ).join(',\n    ')}`);
        indexFile.push('};');
        Fs.writeFile(`${options.context}/${exportFileName}`, indexFile.join('\n'), cb);
    } );
};
