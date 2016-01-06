var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var browserify = require('browserify');
var sh = require('shelljs');
var source = require('vinyl-source-stream');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['./www/js/**/*.js']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src(paths.sass)
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(concat('app.css'))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('browserify', function(){
  var bundler = browserify({
    entries: ['./www/js/main'],
    extensions: ['.js'],
    debug: true,
  });

  var buildBundle = function(){
    return bundler.bundle()

    .on('error', function(err){
      console.log('build error', err);
    })

    .pipe(source('bundle.js'))

    .pipe(gulp.dest('www/'));
  };
  return buildBundle();
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['browserify']);
});

gulp.task('serve', function(done) {
  sh.exec('ionic serve', done);
});

gulp.task('ipad', function(done) {
  sh.exec('ionic prepare ios', done);
  sh.exec('ionic run ios --target=\"iPad-Air\"', done);
});

gulp.task("emulate android", function(done){
  sh.exec("ionic run android", done);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
