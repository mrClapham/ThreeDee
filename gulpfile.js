/**
 * Created by grahamclapham on 26/08/2014.
 */
var gulp = require('gulp');
var uglify = require('gulp-uglify');


gulp.task('default', function() {
    // place code for your default task here
    gulp.src('app/js/*/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('builds/dist'))
});

gulp.task('browserify', function() {
    // place code for your default task here
});

gulp.task('dist', function() {
    gulp.src('app/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('builds/dist'))
});

