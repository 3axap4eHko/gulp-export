Gulp Export Plugin
==================

## Install
 $ npm install gulp-export

## Usage

Let's we have the next file structure
```
|   .gitignore
|   gulpfile.js
|   jsconfig.json
|   LICENSE
|   package.json
|   README.md
|
\---src
    |   file1.js
    |   file1.map
    |   file2.js
    |   file3.jsx
    |   _exclude.js
    |
    \---folder1
            file1_1.js
            file1_2.js
            file1_3.jsx
            _exclude.js
```
The module exports files to single file with name from main package.json
```
module.exports = {
    "file1": require('./src/file1.js'),
    "file2": require('./src/file2.js'),
    "file3": require('./src/file3.jsx'),
    "folder1": {
        "file1_1": require('./src/folder1/file1_1.js'),
        "file1_2": require('./src/folder1/file1_2.js'),
        "file1_3": require('./src/folder1/file1_3.jsx')
    }
};
```
gulpfile.js
```
"use strict";
const gulp = require('gulp');
const gexport = require("gulp-export");

gulp.task('js-export', function() {
    return gulp.src(['./src/**/*.*'])
        .pipe(gexport({excludeRegExp: /[\\\/]_/, includeRegExp: /\.js[x]?$/}));
});

gulp.task('default', ['js-export']);
```

## License
[The MIT License](http://opensource.org/licenses/MIT)
Copyright (c) 2015 Ivan Zakharchenko