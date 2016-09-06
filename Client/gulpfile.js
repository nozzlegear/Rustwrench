"use strict";

const gulp       = require("gulp");
const chokidar   = require("chokidar");
const sass       = require("gulp-sass");
const autoprefix = require("gulp-autoprefixer");
const minify     = require("gulp-clean-css");
const rename     = require("gulp-rename");

//Tasks
const sassFiles = ["css/**/*.scss"];
const sassTask = (gulpSrc) =>
{
    const cssMinOptions = {
        processImport: false,
        processImportFrom: ['!fonts.googleapis.com']
    }
    
    return gulpSrc
        .pipe(sass())
        .pipe(autoprefix())
        .pipe(minify(cssMinOptions))
        .pipe(rename((path) => 
        {
            path.extname = ".min.css";
        }))
        .pipe(gulp.dest('content/css'));
}

gulp.task("sass", () =>
{
    return sassTask(gulp.src(sassFiles));
})

gulp.task("default", ["sass"]);

gulp.task("watch", ["sass"], (cb) =>
{
    chokidar.watch(sassFiles, {ignoreInitial: true}).on("all", (event, path) =>
    {
        console.log(`${event}: Sass file ${path}`);
        
        if (path.indexOf("_variables.scss") > -1)
        {
            //Recompile all sass files with updated variables.
            return sassTask(gulp.src(sassFiles));
        }
        
        return sassTask(gulp.src(path));
    })
})