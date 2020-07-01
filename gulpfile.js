const gulp = require("gulp");
const webpack = require("webpack-stream");
const compiler = require("webpack");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const clean = require("gulp-clean");
const webpackConfig = require("./webpack.config");
const libWebpackConfig = require("./webpack.config.libs");

exports.default = exports.watch = gulp.series(
    gulp.parallel(taskExtentalLibs, taskCoreJsMax, taskCoreJsMin, taskCoreJsMaxBabel, taskCoreJsMinBabel),
    _core_libs_clean,
    gulp.parallel(taskCoreLibsJsMax, taskCoreLibsJsMin),
    _core_libs_copy,
    _watch
);

exports.build = gulp.series(
    gulp.parallel(taskExtentalLibs, taskCoreJsMax, taskCoreJsMin, taskCoreJsMaxBabel, taskCoreJsMinBabel),
    _core_libs_clean,
    gulp.parallel(taskCoreLibsJsMax, taskCoreLibsJsMin),
    _core_libs_copy
);

function _watch()
{
    gulp.watch("src/core/**/*", gulp.parallel(taskCoreJsMax, taskCoreJsMin));
    gulp.watch("libs/**/*", gulp.parallel(taskExtentalLibs));
    gulp.watch("src/libs/**/*", gulp.series(_core_libs_clean, gulp.parallel(taskCoreLibsJsMax, taskCoreLibsJsMin), _core_libs_copy));
}

function _core_libs_clean()
{
    return gulp.src("build/libs/*", { "read": false }).pipe(clean());
}

function _core_libs_copy()
{
    return gulp.src("build/libs/*.js").pipe(gulp.dest("../cables_api/public/libs_core/"));
}

function taskExtentalLibs()
{
    return (
        gulp
            .src(["libs/*.js"])
            // .pipe(sourcemaps.init())
            .pipe(concat("libs.core.js"))
            .pipe(gulp.dest("build"))
            .pipe(rename("libs.core.min.js"))
            // .pipe(uglify())
            // .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest("build"))
    );
}

function taskCoreJsMax()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(false, false),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    }
                )
            )
            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function taskCoreJsMaxBabel()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(false, true),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    }
                )
            )
            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function taskCoreJsMin()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(true, false),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    }
                )
            )

            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function taskCoreJsMinBabel()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(true, true),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    }
                )
            )

            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function taskCoreLibsJsMax()
{
    return gulp.src(["src/libs/**/*"])
        .pipe(
            webpack(
                {
                    "config": libWebpackConfig(false),
                },
                compiler,
                (err, stats) =>
                {
                    if (err) throw err;
                    if (stats.hasErrors())
                    {
                        return new Error(stats.compilation.errors.join("\n"));
                    }
                }
            )
        )
        .pipe(gulp.dest("build/libs"))
        .on("error", (err) =>
        {
            console.error("WEBPACK ERROR", err);
        });
}

function taskCoreLibsJsMin()
{
    return gulp.src(["src/libs/**/*"])
        .pipe(
            webpack(
                {
                    "config": libWebpackConfig(true),
                },
                compiler,
                (err, stats) =>
                {
                    if (err) throw err;
                    if (stats.hasErrors())
                    {
                        return new Error(stats.compilation.errors.join("\n"));
                    }
                }
            )
        )
        .pipe(gulp.dest("build/libs"))
        .on("error", (err) =>
        {
            console.error("WEBPACK ERROR", err);
        });
}
