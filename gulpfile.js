/* eslint-disable no-undef */
/* eslint-disable semi */
'use strict';

const gulp = require('gulp');
// const newer = require('gulp-newer')
const changed = require('gulp-changed');
const imageResize = require('gulp-image-resize');
const imagemin = require('gulp-imagemin');
const imageminMozJpeg = require('imagemin-mozjpeg');
const imageminWebp = require('imagemin-webp');
const rename = require('gulp-rename');
// const ffmpeg = require('gulp-fluent-ffmpeg');
const sass = require('gulp-sass');
// const cleanCSS = require('gulp-clean-css');
// const babel = require('gulp-babel');
// const sourcemaps = require('gulp-sourcemaps');
// const uglify = require('gulp-uglify');
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

// Image resize and compress
function jpg(cb) {
    [360, 480, 640, 800, 1024, 1280, 1600].forEach(function(size) {
        gulp
            .src('src/images/*.{jpg,jpeg,png}')
            .pipe(changed('dist/images'))
            .pipe(imageResize({ width: size, format: 'jpeg', quality: 1 }))
            .pipe(
                rename(function(path) {
                    path.basename = `${path.basename}_${size}`;
                    path.extname = '.jpg';
                })
            )
            .pipe(
                imagemin(
                    [
                        imageminMozJpeg({
                            quality: 90,
                            progressive: true
                        })
                    ],
                    { verbose: true }
                )
            )
            .pipe(gulp.dest('dist/images'));
    });
    cb();
}
gulp.task('jpg', jpg);

function webp(cb) {
    [360, 480, 640, 800, 1024, 1280, 1600].forEach(function(size) {
        return gulp
            .src('src/images/*.{jpg,jpeg,png}')
            .pipe(changed('dist/images'))
            .pipe(imageResize({ width: size, quality: 1, noProfile: true }))
            .pipe(
                imagemin(
                    [
                        imageminWebp({
                            quality: 90
                        })
                    ],
                    { verbose: true }
                )
            )
            .pipe(
                rename(function(path) {
                    path.basename = `${path.basename}_${size}`;
                    path.extname = '.webp';
                })
            )
            .pipe(gulp.dest('dist/images'));
    });
    cb();
}
gulp.task('webp', webp);

gulp.task('svgCopy', function() {
    return gulp.src('src/images/*.svg')
        .pipe(gulp.dest('dist/images'));
});

// Copy videos to dist
// function mp4(cb) {
//     [
//         { width: 384, height: 256 },
//         { width: 480, height: 320 },
//         { width: 768, height: 512 },
//         { width: 960, height: 640 },
//     ].forEach((dimension) => {
//         return gulp.src('src/videos/*.mov')
//             .pipe(ffmpeg('mp4'), (options) => {
//                 return options
//                     .videoCodec('libx264')
//                     .size(dimension.width + 'x' + dimension.height)
//             })
//             .pipe(gulp.dest('dist/videos'))
//     });
//     cb();
// }


// gulp.task('videos', function() {
//     return gulp.src('src/videos/*.mov')
//         .pipe(ffmpeg(function(options) {
//             return options
//                 .videoCodec('libx264')
//                 .size('384x?')
//                 .outputFormat('mp4')
//         }))
//         .pipe(gulp.dest('dist/videos'))
// });

// gulp.task('videos', function () {
//     return gulp.src('src/videos/*.{mp4,webm,ogg}')
//         .pipe(gulp.dest('dist/videos'));
// });

// Compile SCSS files to CSS
sass.compiler = require('node-sass');

gulp.task('sass', function() {
    return (
        gulp
            .src('src/sass/style.scss')
            .pipe(sass().on('error', sass.logError))
        // .pipe(gulp.dest('src/scss'))
        // .pipe(cleanCSS())
        // .pipe(rename(function (path) {path.basename = `${path.basename}.min`}))
        // .pipe(gulp.dest('src/sass'))
            .pipe(gulp.dest('dist'))
            .pipe(browserSync.stream())
    );
});

// Copy supplemental styles to dist
gulp.task('styles', function () {
    return gulp.src('src/styles/*')
        .pipe(gulp.dest('dist/styles'));
});

// JavaScript
gulp.task('js', () =>
    gulp.src('src/js/*.js')
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
        .pipe(gulp.dest('dist/js'))
);

// browserSync and file watching
gulp.task('serve', function() {
    browserSync.init({
        server: 'dist'
    // browser: 'FireFox'
    });

    gulp.watch('src/images/*.{jpg,jpeg,png}', gulp.series('images'));
    // gulp.watch(['src/pug/*.pug', 'src/svg/*.svg'], gulp.series('pug'));
    gulp.watch('src/images/*.svg', gulp.series('svgCopy'));
    gulp.watch('src/sass/*.scss', gulp.series('sass'));
    // gulp.watch('src/js/inline.js', gulp.series('js', 'pug'));
    gulp.watch('src/styles/*.css', gulp.series('styles'));
    gulp.watch('src/js/*.js', gulp.series('js'));
    gulp.watch(['dist/index.html', 'dist/js/*']).on('change', browserSync.reload);
});

gulp.task('default', gulp.series('serve'));
gulp.task('images', gulp.parallel('jpg', 'webp'));
// gulp.task('build', gulp.parallel('root', 'favicons', 'fonts', 'jpg', 'webp', 'videos', 'pug', 'sass', 'js'));
