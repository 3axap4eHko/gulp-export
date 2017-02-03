# Gulp Export Plugin

Export files through `index.js`

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
    |   Class1.js
    |   Class1.map
    |   Class2.js
    |   utils1.jsx
    |   _exclude.js
    |
    \---Namespace
            Class4.js
            Class5.js
            utils2.jsx
            _exclude.js
```
The module exports the files to a single file
``` javascript
// ./build/index.js
import _Class1 from './Class1';
import _Class2 from './Class1';
import * as _utils1 from './utils1';

import _NamespaceClass4 from './Namespace/Class4';
import _NamespaceClass5 from './Namespace/Class5';
import * as _namespaceUtils2 from './Namespace/utils2';

export default {
    'Class1': _Class1,
    'Class2': _Class2,
    'utils1': utils1,
    'NamespaceClass4': NamespaceClass4,
    'NamespaceClass5': NamespaceClass5,
    'namespaceUtils2': namespaceUtils2
};
```
gulpfile.js
```
'use strict';

const sourceDir = './src';
const buildDir = './build';

const Del = require('del');
const Gulp = require('gulp');
const ESLlint = require('gulp-eslint');
const Sourcemaps = require('gulp-sourcemaps');
const Export = require('gulp-export');
const Babel = require('gulp-babel');

Gulp.task('clean', cb => {
  return Del([buildDir], cb);
});

Gulp.task('js-compile', ['clean'], function() {
  return Gulp.src([`${sourceDir}/**/*.js`])
    .pipe(ESLlint())
    .pipe(ESLlint.format())
    .pipe(ESLlint.failAfterError())
    .pipe(Export({
        context: './src',
        exclude: /_/,           // excluded all files with underscore
        exportType: 'default',  // export as default can be: named, default and global
    }))
    .pipe(Sourcemaps.init())
    .pipe(Babel())
    .pipe(Sourcemaps.write('.'))
    .pipe(Gulp.dest(buildDir));
});

gulp.task('default', ['js-export']);
```

## License
[The MIT License](http://opensource.org/licenses/MIT)
Copyright (c) 2015-present Ivan Zakharchenko