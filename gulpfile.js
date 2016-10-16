const gulp          = require('gulp');

const annotate      = require('gulp-ng-annotate');
const autoprefixer  = require('gulp-autoprefixer');
const Builder       = require('systemjs-builder');
const concat        = require('gulp-concat');
const del           = require('del');
const es            = require('event-stream');
const folders       = require('gulp-folders');
const htmlmin       = require('gulp-htmlmin');
const htmlreplace   = require('gulp-html-replace');
const include       = require('gulp-include');
const inlineTemp    = require('gulp-inline-ng2-template');
const jsmin         = require('gulp-jsmin');
const path          = require('path');
const sass          = require('gulp-sass');
const sourcemaps    = require('gulp-sourcemaps');
const typescript    = require('gulp-typescript');
const tslint        = require('gulp-tslint');
const uglify        = require('gulp-uglify');
const uglifycss     = require('gulp-uglifycss');

const tscConfig     = require('./tsconfig.json');

// clean the contents of the distribution directory
gulp.task('clean', function () {
    return del('dist/**/*');
});

// ts linting
gulp.task('tslint', function () {
    return gulp.src('app/**/*.ts')
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report());
});


/* dev scripts */

// copy resources
gulp.task('copy:resources', ['clean'], function () {
    var files = gulp.src([
        'systemjs.config.dev.js',
        'app/**/*',
        '!app/**/styles/',
        '!app/**/*.scss',
        '!app/**/*.ts'
    ], {
        base: './'
    })
        .pipe(gulp.dest('dist'));

    var fontawesome = gulp.src('node_modules/font-awesome/fonts/**/*')
        .pipe(gulp.dest('dist/styles/fonts/'));

    var fontawesome2 = gulp.src('node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*')
        .pipe(gulp.dest('dist/styles/fonts/bootstrap/'));

    var rxjs = gulp.src(['node_modules/rxjs/**/*'])
        .pipe(gulp.dest('dist/scripts/rxjs'));

    var webapi = gulp.src(['node_modules/angular2-in-memory-web-api/**/*'])
        .pipe(gulp.dest('dist/scripts/angular2-in-memory-web-api'));

    var angular2 = gulp.src(['node_modules/@angular/**/*'])
        .pipe(gulp.dest('dist/scripts/@angular'));

    var images = gulp.src('static/images/**/*')
        .pipe(gulp.dest('dist/images/'));

    return es.concat(files, fontawesome, fontawesome2, rxjs, webapi, angular2, images);
});

// TypeScript compile
gulp.task('compile', ['clean', 'tslint'], function () {
    return gulp.src('app/**/*.ts')
        .pipe(inlineTemp({ UseRelativePaths: true, indent: 0, removeLineBreaks: true }))
        .pipe(sourcemaps.init())
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/app'));
});

// build html
gulp.task('html', ['copy:resources', 'compile'], function() {
    gulp.src('index.html')
        .pipe(gulp.dest('dist'));
});

// build styles
gulp.task('build:styles', ['copy:resources'], function () {
    var vendors = gulp.src([
        'static/styles/*.scss',
        '!static/styles/_*.scss'
    ])
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(concat('vendors.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/styles/'));

    var styles = gulp.src([
        'app/**/styles/*.scss',
        '!app/**/styles/_*.scss'
    ])
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src']
        }))
        .pipe(concat('app.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/styles/'));

    return es.concat(vendors, styles);
});

// build dependencies
gulp.task('build:deps', ['clean'], function () {
    return gulp.src([
        'static/scripts/*.js'
    ]).pipe(include())
        .pipe(gulp.dest('dist/scripts/'));
});


/* production scripts */

// copy resources
gulp.task('copy:resources:prod', ['clean'], function () {
    var fontawesome = gulp.src('node_modules/font-awesome/fonts/**/*')
        .pipe(gulp.dest('dist/styles/fonts/'));

    var fontawesome2 = gulp.src('node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*')
        .pipe(gulp.dest('dist/styles/fonts/bootstrap/'));

    var images = gulp.src('static/images/**/*')
        .pipe(gulp.dest('dist/images/'));

    return es.concat(fontawesome, fontawesome2, images);
});

// TypeScript compile
gulp.task('compile:prod', ['clean', 'tslint'], function () {
    return gulp.src([
            'typings/**/*.ts.d',
            'app/**/*.ts'
        ])
        .pipe(inlineTemp({ UseRelativePaths: true, indent: 0, removeLineBreaks: true }))
        // .pipe(sourcemaps.init())
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(jsmin())
        // .pipe(uglify())
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/app'));
});

gulp.task('bundle-app:prod', ['copy:resources:prod', 'compile:prod'], function() {
    var builder = new Builder('', './systemjs.config.js');

    return builder
        .bundle(
            'dist/app/**/* - [@angular/**/*.js] - [rxjs/**/*.js]', 'dist/app.min.js',
            { minify: false, sourceMaps: false }
            // { minify: true, sourceMaps: true }
        ).then(function() {
        })
        .catch(function(err) {
            console.log(err);
        });
});

gulp.task('bundle-deps:prod', ['copy:resources:prod', 'compile:prod'], function() {
    var builder = new Builder('', './systemjs.config.js');

    return builder
        .bundle(
            'dist/app/**/*.js - [dist/app/**/*.js]', 'dist/deps.min.js',
            { minify: true, sourceMaps: true }
        ).then(function() {
        })
        .catch(function(err) {
            console.log(err);
        });
});

// Bundle dependencies and app into one file (app.bundle.js)
gulp.task('bundle:prod', ['bundle-app:prod', 'bundle-deps:prod'], function () {
    return gulp.src([
        'dist/app.min.js',
        'dist/deps.min.js'
    ])
        .pipe(concat('app.bundle.js'))
        // .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

// build html production
gulp.task('html:prod', ['bundle:prod'], function() {
    gulp.src('index.html')
        .pipe(htmlreplace({
            'deps': 'deps.min.js',
            'app': 'app.min.js'
            // 'app': 'app.bundle.js'
        }))
        .pipe(htmlmin())
        .pipe(gulp.dest('dist'));
});

// build styles production
gulp.task('build:styles:prod', ['copy:resources:prod'], function () {
    var vendors = gulp.src([
        'static/styles/*.scss',
        '!static/styles/_*.scss'
    ])
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(uglifycss({
            "maxLineLen": 10000,
            "uglyComments": true
        }))
        .pipe(concat('vendors.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/styles/'));

    var styles = gulp.src([
        'app/**/styles/*.scss',
        '!app/**/styles/_*.scss'
    ])
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src']
        }))
        .pipe(autoprefixer())
        .pipe(uglifycss({
            "maxLineLen": 10000,
            "uglyComments": true
        }))
        .pipe(concat('app.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/styles/'));

    return es.concat(vendors, styles);
});

// build dependencies production
gulp.task('build:deps:prod', ['clean'], function () {
    return gulp.src([
        'static/scripts/*.js'
    ]).pipe(include())
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts/'));
});


/* default */
gulp.task('build', ['html', 'build:styles', 'build:deps']);

gulp.task('build:prod', ['html:prod', 'build:styles:prod', 'build:deps:prod'], function() {
    // remove modules folder
    return del([
        'dist/app'
    ]);
});

gulp.task('default', ['build']);

gulp.task('heroku', ['build:prod']);
