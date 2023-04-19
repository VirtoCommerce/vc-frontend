import { useI18n } from "vue-i18n";
import type { PropertyType } from "../../enums/property-type.enum";
import type { Property } from "@/xapi/types";

export function getPropertyValue(property: Property): string {
  const { t, d } = useI18n();

  switch (property.valueType) {
    case "Boolean":
      return property.value ? t("common.labels.true_property") : t("common.labels.false_property");

    case "DateTime":
      return d(new Date(property.value), "long");

    default:
      return String(property.value);
  }
}

export function getPropertiesGroupedByName(items: Property[], type: PropertyType): Record<string, Property> {
  return items.reduce<Record<string, Property>>((propertiesByName, item) => {
    if (
      item.hidden ||
      item.type !== type ||
      item.value === void 0 ||
      (item.value === null && item.valueType !== "Boolean")
    ) {
      return propertiesByName;
    }

    const value: string = getPropertyValue(item);

    if (propertiesByName[item.name]) {
      propertiesByName[item.name].value += `, ${value}`;
    } else {
      propertiesByName[item.name] = { ...item, value, label: item.label || item.name };
    }

    return propertiesByName;
  }, {});
}
