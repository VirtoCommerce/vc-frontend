
import Vue from "vue";
import { MoneyType, PriceType } from "@core/api/graphql/types";
import { baseUrl } from "@core/constants";
import { appendSuffixToFilename } from "@core/utilities";


Vue.filter('assetUrl', function (filename: string) {
  if (!filename) return null;

  return `${baseUrl}/themes/assets/static/${filename}`;
})

Vue.filter('imgUrl', (value: string, suffix: string) => {
  if (!value) return '';
  if (!suffix) return value;
  const result = appendSuffixToFilename(value, `_${suffix}`, true);
  return result;
});


Vue.filter('money', function (value: MoneyType) {
  if (!value) return null;

  return value?.formattedAmount;
})

Vue.filter('price', function (actual: MoneyType, regular: MoneyType) {
  if (!actual) return null;

  if (!regular) {
    return actual.formattedAmount;
  } else if (actual.amount != regular.amount) {
    return actual.formattedAmount;
  }
  return null;
})

