export const appendSuffixToFilename = (filename: string, suffix: string, checkIfSuffixExists = false): string => {
  const dotIndex = filename.lastIndexOf(".");
  let result = filename;
  if (dotIndex == -1) {
    result = checkIfSuffixExists && filename.endsWith(suffix) ? filename : filename + suffix;
  } else {
    const fileNameWithoutExt = filename.substring(0, dotIndex);
    result =
      checkIfSuffixExists && fileNameWithoutExt.endsWith(suffix)
        ? filename
        : fileNameWithoutExt + suffix + filename.substring(dotIndex);
  }
  return result;
};
