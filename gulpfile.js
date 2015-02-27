var exec = require('child_process').exec;

var colors = require('colors');
var gulp   = require('gulp');

var concat         = require('gulp-concat');
var uglify         = require('gulp-uglify');
var less           = require('gulp-less');
var del            = require('del');
var mainBowerFiles = require('main-bower-files');


var paths = {
  scripts: [],
  watch : ['app/_attachments/index.html', 'app/views/**', 'src/**'],
  scriptDest : "./app/_attachments/script",
  cssDest : "./app/_attachments/style"
};

gulp.task("vendor", function(){
    gulp.src(mainBowerFiles())
    .pipe(uglify())
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest(paths.scriptDest));
});

gulp.task("push", ['vendor', 'couchapp'], function(){
  console.log('app pushed');
});

gulp.task("couchapp", ['less', 'js'], function(){
  exec("cd app; couchapp push", function (error, stdout, stderr) {      
    console.log('Gulp CouchApp:'.magenta);
    if (error !== null) {
      console.log('ERROR:'.red + ' ' + error.red);
      return;
    }
    console.log(stdout.grey);
    var pieces = stderr.split("\n");
    console.log(pieces[0])
    console.log(pieces[1].magenta.underline);
  });

});

gulp.task('less', function(){
  return gulp.src('src/less/**/*.less')
  .pipe(less({
    paths: [ __dirname + '/bower_components/bootstrap-less/less/' ],
    compress : true
  }))
  .pipe(gulp.dest(paths.cssDest));
});

gulp.task('js', function(){
  return gulp.src('src/js/**/*.js')
  .pipe(uglify())
  .pipe(concat('app.min.js'))
  .pipe(gulp.dest(paths.scriptDest));
});

gulp.task('watch', function(){
  gulp.watch(paths.watch, ['couchapp']);
});
