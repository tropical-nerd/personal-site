/* eslint-disable no-undef */
/* eslint-disable semi */
'use strict';

const gulp = require('gulp');
// const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('node-sass'));
const browserSync = require('browser-sync');

// Begin Gulp task definitions

// Copy favicons to dist
gulp.task('favicons', function () {
    return gulp.src('src/favicons/*')
        .pipe(gulp.dest('dist/favicons'));
});

// Copy root files to dist
gulp.task('root', function () {
    return gulp.src('src/root/{*,.*}')
        .pipe(gulp.dest('dist'));
});

// Copy fonts to dist
gulp.task('fonts', function() {
    return gulp.src('src/fonts/*').pipe(gulp.dest('dist/fonts'));
});

// Copy SVG to dist
gulp.task('svg', function() {
    return gulp.src('src/images/*.svg').pipe(gulp.dest('dist/images'));
});

// Compile SCSS files to CSS
gulp.task('sass', function(done) {
    return (
        gulp
            .src('src/sass/**/*.scss', {base: 'src/sass/'})
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('dist'))
            .pipe(browserSync.stream())
    );
    done();
});

// JavaScript
gulp.task('js', () =>
    gulp.src('src/js/**/*.js', {base: 'src/js'})
        // .pipe(sourcemaps.init())
        // .pipe(
        //     babel({
        //         presets: ['@babel/preset-env']
        //     })
        // )
        // .pipe(uglify())
        // .pipe(
        //     rename(function(path) {
        //         path.basename = `${path.basename}.min`;
        //     })
        // )
        .pipe(gulp.dest('dist/'))
);

// Copy page assets to individual page directories
gulp.task('page-assets', () =>
    gulp.src('src/page-assets/**/*', {base: 'src/page-assets'})
    .pipe(gulp.dest('dist'))
);

// browserSync and file watching
gulp.task('serve', function() {
    browserSync.init({
        server: 'dist'
    });

    gulp.watch('src/sass/**/*.scss', gulp.series('sass'));
    gulp.watch('src/js/**/*.js', gulp.series('js'));
    gulp.watch(['dist/index.html', 'dist/**/*.js']).on('change', browserSync.reload);
    gulp.watch('src/page-assets/**/*', gulp.series('page-assets'));
});

gulp.task('default', gulp.series('serve'));
gulp.task('build', gulp.parallel('root', 'favicons', 'fonts', 'sass', 'svg', 'js', 'page-assets'));
