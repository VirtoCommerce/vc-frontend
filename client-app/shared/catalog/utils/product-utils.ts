import { PriceType, Product, Property, VariationType } from "@/xapi/types";
import { useI18n } from "vue-i18n";
import { RouteLocationRaw } from "vue-router";

export function getProductRoute(product: Product | VariationType): RouteLocationRaw {
  return product.slug ? `/${product.slug}` : { name: "Product", params: { productId: product.id } };
}

export function prepareProperties(properties: Property[], propName: string) {
  const { t, d } = useI18n();
  let propValue = "";
  switch (properties[0].valueType) {
    case "Boolean":
      propValue = properties
        .map((x) => (x.value ? t("common.labels.true_property") : t("common.labels.false_property")))
        .join(", ");
      break;
    case "DateTime":
      propValue = d(new Date(properties[0].value), "long");
      break;
    default:
      propValue = properties.map((x) => x.value).join(", ");
  }
  return {
    name: properties[0].label || propName,
    values: propValue,
  };
}

export function getProductDiscountLabel(price: PriceType): string | null {
  return price.discountPercent >= 0.05 ? `-${Math.round(price.discountPercent * 100)}%` : null;
}
