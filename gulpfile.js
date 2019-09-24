const { src, dest, parallel, watch } = require( 'gulp' ),
    autoprefixer = require ('gulp-autoprefixer'),
    concat = require( 'gulp-concat' ),
    cssMin = require('gulp-csso'),
    rename = require('gulp-rename'),
    sass = require( 'gulp-sass' ),
    tinify = require('gulp-tinify'),
    gcmq = require('gulp-group-css-media-queries'),
    htmlMin = require('gulp-htmlmin'),
    normalize = require('node-normalize-scss'),
    env = require('node-env-file'),
    svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    API_KEY_TINIFY = env('../api/.env').tinify,
    views= ['index.html'],
    styles = ['sass/mixins/*.scss', 'sass/**/*.scss'];

function css() {
    return src( styles )
        .pipe( concat( 'style.scss'))
        .pipe( sass({includePaths: normalize.includePaths}))
        .pipe(autoprefixer({
            cascade: false,
        }))
        .pipe(gcmq())
        .pipe(dest('style/'))
        .pipe(cssMin())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest('dist/style/'))
        .pipe(dest('style/'));
}

function html() {
    return src(views)
        .pipe(htmlMin({collapseWhitespace: true}))
        .pipe(dest('dist/'))
}

function img() {
    return src(images, {nodir: true})
        .pipe(tinify(API_KEY_TINIFY))
        .pipe(dest('dist/__img/'))
}

function svg() {
    return src('img/svg/**/*.svg')
    // minify svg
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        // remove all fill, style and stroke declarations in out shapes
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        // cheerio plugin create unnecessary string '&gt;', so replace it.
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "sprite.svg",
                    render: {}
                }
            }
        }))
        .pipe(dest('img/svg/'))
        .pipe(dest('dist/img/svg/'));
}

function build() {
    return src('fonts/**/*')
        .pipe(dest('dist/fonts/'))
}

function watcher (cb) {
    watch(styles, css);
    cb();
}

exports.html = html;
exports.css = css;
exports.img = img;
exports.svg = svg;
exports.watcher = watcher;
exports.build = build;
exports.default = parallel(html, css, build);
