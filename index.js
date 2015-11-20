/*! Gulp Export Plugin v0.0.3 | Copyright (c) 2015 Ivan (3axap4eHko) Zakharchenko*/
'use strict';

const fs = require('fs');
const path = require('path');
const through = require('through2');

function setPath(scope, namespace, value) {
    if (namespace.length <= 1) {
        scope[namespace[0]] = value;
    } else {
        var key = namespace.shift();
        if (!scope[key]) {
            scope[key] = {};
        }
        setPath(scope[key], namespace, value);
    }
    return scope;
}

const defaultOptions = {
    skipCountOfNamespaceParts: 1,
    excludeRegExp: /^_/,
    includeRegExp: /\.js$/
};

module.exports = function(options) {
    options = Object.assign({}, defaultOptions, options || {});

    var filesToExport = {};
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));

    return through.obj( (file, enc, cb) => {
        const relativeFilename = path.relative(file.cwd, file.history[file.history.length-1]);

        if (!options.excludeRegExp.test(relativeFilename) && options.includeRegExp.test(relativeFilename)) {
            var moduleName = relativeFilename.replace(/[\\\/]/g,'/').replace('.js','');
            var namespace = moduleName.split('/').slice(options.skipCountOfNamespaceParts);
            setPath(filesToExport, namespace, moduleName);
        }
        cb(null, file);
    }, cb => {
        var exportFileName = options.filename || packageJson.main;
        var moduleJS = `module.exports = ${JSON.stringify(filesToExport, null, '    ')};`;
        moduleJS = moduleJS.replace(/: "(.*?)"/g, ': require(\'./$1\')');
        fs.writeFile(exportFileName, moduleJS, cb);
    } );
};
