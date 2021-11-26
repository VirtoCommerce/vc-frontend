const { src, dest } = require('gulp');
const rename = require("gulp-rename");
const zip = require("gulp-zip");
const gitignore = require("gulp-exclude-gitignore");
const merge2 = require("merge2");


function getPackage() {
  delete require.cache[require.resolve("./package.json")];
  return require("./package.json");
}

function compress(){
  var package = getPackage();
  return merge2(src(["./*/**", '!./client-app/**'])
         .pipe(gitignore(".gitignore")),
          // Need to add them manually because otherwise all bundles will be skipped as they are in .gitignore
         src("./assets/static/bundle/**"))
      .pipe(
          rename(function(path) {
              path.dirname = "default/" + path.dirname;
          })
      )
      .pipe(zip(package.name + "-" + package.version + ".zip"))
      .pipe(dest("./artifacts"));
}

exports.compress = compress
exports.default = exports.compress;
