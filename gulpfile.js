const { src, dest } = require('gulp');
const rename = require("gulp-rename");
const zip = require("gulp-zip");

function getPackage() {
  delete require.cache[require.resolve("./package.json")];
  return require("./package.json");
}

function compress() {
  const pkg = getPackage();

  return src(
    ["./assets/**", "./config/**", "./layout/**", "./locales/**", "./templates/**", "!./assets/index.html"],
    { base: "./" }
  ).pipe(
    rename(function(path) {
      path.dirname = "default/" + path.dirname;
    })
  ).pipe(
    zip(pkg.name + "-" + pkg.version + ".zip")
  ).pipe(dest("./artifacts"));
}

exports.compress = compress;
exports.default = exports.compress;
