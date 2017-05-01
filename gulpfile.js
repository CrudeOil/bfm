var gulp = require('gulp');
var runSequence = require('run-sequence');
var minify = require('gulp-minify');
var inject = require('gulp-inject');
var typescript = require('gulp-tsc');
var sourcemaps = require('gulp-sourcemaps');


var outdir = './out'
var libs = '{bootstrap,jquery}'

// npm dependencies
gulp.task('npm:copy', (cb) => {
    gulp.src([`node_modules/${libs}/dist/*`, `node_modules/${libs}/dist/**/*`], {base: 'node_modules'})
        .pipe(gulp.dest(`${outdir}/lib/`));
    cb();
});

// source stuff
gulp.task('src:copy', (cb) => {
    gulp.src(['src/*.html'], {base: 'src'})
        .pipe(gulp.dest(`${outdir}`));
    gulp.src(['src/css/*.css'], {base: 'src'})
        .pipe(gulp.dest(`${outdir}`));
    gulp.src(['src/js/*.js'], {base: 'src'})
        .pipe(gulp.dest(`${outdir}`));
    cb();
});

// inject dependencies
gulp.task('insertjs', function(cb){
    return gulp.src(`${outdir}/index.html`)
        .pipe(inject(gulp.src([`${outdir}/lib/${libs}/**/${libs}.min.js`, `${outdir}/js/*.js`], {base: outdir}), {
                starttag: '<!-- gulp:js -->',
                endtag: '<!-- endgulp -->',
                relative:true
            }
        ))
        .pipe(gulp.dest(outdir));
    cb();
});

gulp.task('insertcss', function(cb){
    return gulp.src(`${outdir}/index.html`)
        .pipe(inject(gulp.src([`${outdir}/lib/*/**/*.css`, `${outdir}/css/*.css`], {base: outdir}), {
            starttag: '<!-- gulp:css -->',
            endtag: '<!-- endgulp -->',
            relative:true
        }))
        .pipe(gulp.dest(outdir));
    cb();
});

gulp.task('deploy', () => {
    runSequence('npm:copy', 'src:copy', 'insertjs', 'insertcss');
});