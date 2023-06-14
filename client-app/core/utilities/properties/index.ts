import { globals } from "@/core/globals";
import { PropertyValueType } from "../../enums";
import type { PropertyType } from "../../enums";
import type { Property } from "@/core/api/graphql/types";

export function getPropertyValue(property: Property): string {
  const { t, d } = globals.i18n.global;

  switch (property.valueType) {
    case PropertyValueType.Boolean:
      return property.value ? t("common.labels.true_property") : t("common.labels.false_property");

    case PropertyValueType.DateTime:
      return d(new Date(property.value), "long");

    default:
      return String(property.value);
  }
}

export function getPropertiesGroupedByName(items: Property[], type?: PropertyType): Record<string, Property> {
  return items.reduce<Record<string, Property>>((propertiesByName, item) => {
    if (
      item.hidden ||
      (type && type !== item.type) ||
      item.value === void 0 ||
      (item.value === null && item.valueType !== PropertyValueType.Boolean)
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
