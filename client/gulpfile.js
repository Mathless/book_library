const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const minify = require("gulp-babel-minify");
const rename = require("gulp-rename");
//sass
gulp.task("sass", function () {
  gulp
    .src(["public/*.scss"])
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(rename("main.css"))
    .pipe(gulp.dest("./dist-gulp"));
});

gulp.task("minify", () =>
  gulp
    .src(["./public/friends.js", "./public/news.js", "./public/users.js"])
    .pipe(minify({}))
    .pipe(gulp.dest("./dist-gulp"))
);
gulp.task("default", gulp.parallel(gulp.series("sass"), gulp.series("minify")));
