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
    excludeRegExp: /^_/
};

module.exports = function(options) {
    options = Object.assign({}, defaultOptions, options || {});

    var filesToExport = {};
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd, 'package.json')));

    return through.obj( (file, enc, cb) => {
        const relativeFilename = path.relative(file.cwd, file.history[file.history.length-1]);

        if (!options.excludeRegExp.test(relativeFilename)) {
            var moduleName = relativeFilename.replace(/[\\\/]/g,'/');
            var namespace = moduleName.replace('.js','').split('/').slice(options.skipCountOfNamespaceParts);
            setPath(filesToExport, namespace, relativeFilename);
        }
        cb(null, file);
    }, cb => {
        var exportFileName = options.exportFileName || packageJson.main;
        var moduleJS = `module.exports = ${JSON.stringify(filesToExport, null, '    ')};`;
        moduleJS = moduleJS.replace(/: "(.*?)"/g, ': require(\'./$1\')');
        fs.writeFile(exportFileName, moduleJS, cb);
    } );
};
