//jshint esversion: 6

(() => {
'use strict';

  const fs           = require('fs');
  const path         = require('path');
  const gulp         = require('gulp');
  const brfs         = require('brfs');
  const source       = require('vinyl-source-stream');
  const connect      = require('gulp-connect');
  const sass         = require('gulp-sass');
  const autoprefixer = require('gulp-autoprefixer');
  const reactify     = require('reactify');
  const browserify   = require('browserify');
  const watchify     = require('watchify');
  const uglify       = require('gulp-uglify');
  const replace      = require('gulp-replace');

  function watch() {
    return gulp.watch('./stylesheets/**/*.scss', gulp.series(style));
  }

  function fireUp() {
    return connect.server({
      root: ['dist'],
      port: 8000,
      livereload: true
    });
  }

  function lib(done) {
    var bundler = watchify(browserify({
      cache: {},
      packageCache: {},
      fullPaths: true,
      extensions: '.jsx'
    }));

    bundler.add('./lib/init.js');
    bundler.transform(reactify);
    bundler.transform(brfs);

    bundler.on('update', rebundle);

    function rebundle () {
      console.log('rebundling');
      return bundler.bundle()
        .on('error', function (err) {
          console.log(err.message);
        })
        .pipe(source('main.js'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(connect.reload());
    }

    return rebundle();
  }

  function style(done) {
    return gulp.src('./stylesheets/main.scss')
      .pipe(sass({errLogToConsole: true, outputStyle: 'compressed'}))
      .pipe(autoprefixer())
      .pipe(gulp.dest('./dist/css'))
      .pipe(connect.reload());
  }

  function setVersion(done) {
    return gulp.src('./dist/index.html')
      .pipe(replace(/\?v=([\w\.]+)/g, '?v=' + require('./package.json').version))
      .pipe(gulp.dest('./dist/'))
      .pipe(connect.reload());
  }

  function schemas(done) {
    var source = 'dist/schemes';
    var index = 'index.json';
    var output = [];

    fs.readdirSync(source).forEach(function (folder) {
      if (folder !== index) {

        var files = fs.readdirSync(path.join(source, folder));

        output = output.concat(files.map(function (file) {
          return path.join(folder, path.basename(file, '.json'));
        }));

      }
    });

    fs.writeFileSync(path.join(source, index), JSON.stringify(output));
  }

  function minify(done) {
    return gulp.src('./dist/js/*')
      .pipe(uglify())
      .pipe(gulp.dest('./dist/js'));
  }

  exports.default = gulp.series(setVersion, lib, style, gulp.parallel(fireUp, watch));

})();