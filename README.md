# Gulp Export Plugin

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
The module exports files to single file with name from main section of `package.json` or from options
``` javascript
// ./src/myAwesomeModule.js
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
"use strict";

const gulp = require('gulp');
const gexport = require("gulp-export");

gulp.task('export', function() {
    return gulp.src(['./src/**/*.js*'])
        .pipe(gexport({context: './src', filename: 'index.js'}));
});

gulp.task('default', ['js-export']);
```

## License
[The MIT License](http://opensource.org/licenses/MIT)
Copyright (c) 2015 Ivan Zakharchenko