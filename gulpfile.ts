/**
 * Created by Moiz.Kachwala on 08-06-2016.
 */


"use strict";

const gulp = require("gulp"),
    del = require("del"),
    tsc = require("gulp-typescript"),
    sourcemaps = require("gulp-sourcemaps"),
    tsProject = tsc.createProject("tsconfig.json"),
    tslint = require("gulp-tslint"),
    concat = require("gulp-concat"),
    runSequence = require("run-sequence"),
    nodemon = require("gulp-nodemon"),
    gulpTypings = require("gulp-typings"),
    browserSync = require("browser-sync"),
    less = require('gulp-less'),
    reload = browserSync.reload;

  
//利用gulp启动服务，并使用热加载
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: './'
    }
  });

  gulp.watch(['./dist/client/*.html', './dist/client/styles/**/*.css', './dist/client/resource/request.js' ,'./dist/client/scripts/**/*.js'], {cwd: './'}, reload);
});



/**
 * Remove build directory.
 */
gulp.task("clean", (cb) => {
    return del(["dist"], cb);
});



gulp.task("build:client", function () {
    var tsProject = tsc.createProject("client/tsconfig.json");
    var tsResult = gulp.src("client/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("dist/client"));
});

/**
 * Lint all custom TypeScript files.
 */
gulp.task("tslint", () => {
    return gulp.src("client/app/**/*.ts")
        .pipe(tslint({
			formatter: "prose"
		}))
		.pipe(tslint.report());
});


/**
 * Compile TypeScript sources and create sourcemaps in build directory.
 */
gulp.task("compile", ["tslint"], () => {
    gulp.src('client/**/*.js')
    .pipe(gulp.dest('dist/client'));
    let tsResult = gulp.src("client/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist/client"));
});

//解析less

gulp.task('testLess', function () {
    gulp.src('client/styles/less/*.less')
        .pipe(less())
        .pipe(gulp.dest('client/styles'));
});

/**
 * Copy all resources that are not TypeScript files into build directory. e.g. index.html, css, images
 */
gulp.task("clientResources", () => {
    return gulp.src(["client/**/*", "!**/*.ts", "!client/typings", "!client/typings/**", "!client/*.json"])
        .pipe(gulp.dest("dist/client"));
});



/**
 * Copy all required libraries into build directory.
 */
gulp.task("libs", () => {
    return gulp.src([
        "core-js/client/**",
        "zone.js/dist/zone.js",
        "reflect-metadata/Reflect.js",
        "reflect-metadata/Reflect.js.map",
        "systemjs/dist/system.src.js"
    ], { cwd: "node_modules/**" }) /* Glob required here. */
        .pipe(gulp.dest("dist/client/libs"));
});

/**
 * Copy all required libraries into build directory.
 */
// gulp.task("css", () => {
//     return gulp.src([
//         "bootstrap/dist/**/**"
//     ], { cwd: "node_modules/**" }) /* Glob required here. */
//         .pipe(gulp.dest("dist/client/css"));
// });


/**
 * Install typings for server and client.
 */
gulp.task("installTypings", function () {
    var stream = gulp.src(["./server/typings.json", "./client/typings.json"])
        .pipe(gulpTypings(null)); //will install all typingsfiles in pipeline.
    return stream; // by returning stream gulp can listen to events from the stream and knows when it is finished.
});



/**
 * Build the project.
 * 1. Clean the build directory
 * 2. Build Express server
 * 3. Build the Angular app
 * 4. Copy the resources
 * 5. Copy the dependencies.
 */

gulp.task("build", function (callback) {
    runSequence("clean",  "build:client", "clientResources", "libs", /*"css",*/ callback);
});

/**
 * Watch for changes in TypeScript, HTML and CSS files.
 */
gulp.task("watch", function () {
    gulp.watch(["client/**/*.ts"], ["compile"]).on("change", function (e) {
        console.log("TypeScript file " + e.path + " has been changed. Compiling.");
    });

    gulp.watch(["client/resource/request.js"], ["compile"]).on("change", function (e) {
        console.log("TypeScript file " + e.path + " has been changed. Compiling.");
    });

    gulp.watch(["client/**/*.html", "client/**/*.css","client/**/*.less"], ["clientResources","testLess"]).on("change", function (e) {
        console.log("Resource file " + e.path + " has been changed. Updating.");
    });

    
});

/**
 * Build the project.
 * 1. Clean the build directory
 * 2. Build Express server
 * 3. Build the Angular app
 * 4. Copy the resources
 * 5. Copy the dependencies.
 */

gulp.task("build", function (callback) {
    runSequence("clean", "testLess", "build:client", "clientResources",  "libs", /*"css",*/ callback);
});

gulp.task("default", function () {
    runSequence("testLess", "build:client", "clientResources",  "libs", /*"css",*/ "watch");
});
