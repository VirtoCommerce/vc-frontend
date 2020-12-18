import Vue from "vue";

function appendToFilename(filename: string, suffix: string, checkIfSuffixExists = false ){
  const dotIndex = filename.lastIndexOf(".");
  let result = filename
  if (dotIndex == -1) {
    result = checkIfSuffixExists && filename.endsWith(suffix)?  filename : filename + suffix ;
  }
  else {
    const fileNameWithoutExt = filename.substring(0, dotIndex);
    result = checkIfSuffixExists && fileNameWithoutExt.endsWith(suffix) ? filename :  fileNameWithoutExt + suffix + filename.substring(dotIndex);
  }
  return result;
}

Vue.filter('imgUrl', (value: string, suffix: string) => {
  if (!value) return '';
  if (!suffix) return value;
  const result = appendToFilename(value, `_${suffix}`, true);
  return result;
});

