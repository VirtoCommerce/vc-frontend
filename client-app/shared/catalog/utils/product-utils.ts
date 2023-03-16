import { useI18n } from "vue-i18n";
import type { Property } from "@/xapi/types";

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
