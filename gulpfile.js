const gulp = require("gulp");
const sass = require('gulp-sass');
const concat = require('gulp-concat');

//sass
gulp.task('sass', function (cb) {
    gulp.src(['css/*.scss', 'css/**/*.scss'])
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(concat('bugvolution.css'))
        .pipe(gulp.dest('dist/'));
        cb();
});

gulp.task('watch', function(cb) {
    gulp.watch('css/**/*.scss', gulp.series('sass'));
});

gulp.task('default', gulp.parallel('sass'));