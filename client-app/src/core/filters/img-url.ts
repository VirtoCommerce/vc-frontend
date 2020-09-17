import Vue from "vue";
import { appendToFilename } from "@core/utilities/utilities";


Vue.filter('imgUrl', (value: string, suffix: string) => {
  if (!value) return '';
  if (!suffix) return value;
  const result = appendToFilename(value, `_${suffix}`, true);
  return result;
});

