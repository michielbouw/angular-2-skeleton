const gulp          = require('gulp');

const annotate      = require('gulp-ng-annotate');
const autoprefixer  = require('gulp-autoprefixer');
const concat        = require('gulp-concat');
const del           = require('del');
const es            = require('event-stream');
const folders       = require('gulp-folders');
const htmlmin       = require('gulp-htmlmin');
const include       = require('gulp-include');
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

// TypeScript compile
gulp.task('compile', ['clean', 'tslint'], function () {
    return gulp
        .src('app/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/app'));
});

/* dev scripts */

// compile main app
gulp.task('build:main', ['compile'], function () {
    return gulp.src([
        'dist/app/main.js',
        'dist/app/app.*.js'
    ])
        .pipe(annotate())
        .pipe(concat('_app.js'))
        .pipe(gulp.dest('dist/js'));
});

// compile modules
gulp.task('build:modules', ['build:main'], folders('dist/app/', function (module) {
    return gulp.src([
        path.join('dist/app/', module, module + '.*.js'),
        path.join('dist/app/', module, '**/*.js')
    ])
        .pipe(annotate())
        .pipe(concat(module + '.js'))
        .pipe(gulp.dest('dist/js'));
}));

// copy resources
gulp.task('copy:resources', ['clean'], function () {
    var files = gulp.src([
        'app/**/*',
        '!app/**/*.ts'
    ], {
        base: './'
    })
        .pipe(gulp.dest('dist'));

    var fontawesome = gulp.src('node_modules/font-awesome/fonts/**/*')
        .pipe(gulp.dest('dist/styles/fonts/'));

    var fontawesome2 = gulp.src('node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*')
        .pipe(gulp.dest('dist/styles/fonts/bootstrap/'));

    var images = gulp.src('static/images/**/*')
        .pipe(gulp.dest('dist/images/'));

    return es.concat(files, fontawesome, fontawesome2, images);
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
gulp.task('build:deps:dev', ['clean'], function () {
    return gulp.src([
        'static/scripts/*.js'
    ]).pipe(include())
        .pipe(gulp.dest('dist/scripts/'));
});

// build dependencies
gulp.task('build:deps', ['clean', 'build:modules'], function () {
    return gulp.src([
        'static/scripts/*.js'
    ]).pipe(include())
        .pipe(gulp.dest('dist/scripts/'));
});


/* production scripts */

// compile main app production
gulp.task('build:main:prod', ['compile'], function () {
    return gulp.src([
        'dist/app/main.js',
        'dist/app/app.*.js'
    ])
        .pipe(annotate())
        .pipe(uglify())
        .pipe(concat('_app.js'))
        .pipe(gulp.dest('dist/js'));
});

// compile modules production
gulp.task('build:modules:prod', ['build:main:prod'], folders('dist/app/', function (module) {
    return gulp.src([
        path.join('dist/app/', module, module + '.module.js'),
        path.join('dist/app/', module, '**/*.js')
    ])
        .pipe(annotate())
        .pipe(uglify())
        .pipe(concat(module + '.js'))
        .pipe(gulp.dest('dist/js'));
}));

// copy resources
gulp.task('copy:resources:prod', ['clean'], function () {
    var files = gulp.src([
        'app/**/*',
        '!app/**/*.ts'
    ], {
        base: './'
    })
        .pipe(gulp.dest('dist'));

    var fontawesome = gulp.src('node_modules/font-awesome/fonts/**/*')
        .pipe(gulp.dest('dist/styles/fonts/'));

    var fontawesome2 = gulp.src('node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*')
        .pipe(gulp.dest('dist/styles/fonts/bootstrap/'));

    var images = gulp.src('static/images/**/*')
        .pipe(gulp.dest('dist/images/'));

    return es.concat(files, fontawesome, fontawesome2, images);
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
gulp.task('build:deps:prod', ['clean', 'build:modules'], function () {
    return gulp.src([
        'static/scripts/*.js'
    ]).pipe(include())
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts/'));
});


/* default */
gulp.task('dev_build', ['compile', 'build:styles', 'build:deps:dev'], function() {
    // remove modules folder
    return del([
        'dist/js'
    ]);
});

gulp.task('build', ['build:modules', 'build:styles', 'build:deps'], function() {
    // remove modules folder
    return del([
        'dist/app',
        'dist/js'
    ]);
});

gulp.task('build:prod', ['build:modules:prod', 'build:styles:prod', 'build:deps:prod'], function() {
    // remove modules folder
    return del([
        'dist/app',
        'dist/js'
    ]);
});

gulp.task('default', ['build']);

gulp.task('heroku', ['build:prod']);
