import { PropertyValueTypes } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { Property, PropertyType } from "@/core/api/graphql/types";

export function getPropertyValue(property: Property): string | null | undefined {
  const { t, d, n } = globals.i18n.global;

  if (property.value === null || property.value === undefined) {
    return;
  }

  switch (property.propertyValueType) {
    case PropertyValueTypes.Boolean:
      return property.value ? t("common.labels.true_property") : t("common.labels.false_property");

    case PropertyValueTypes.DateTime:
      return d(new Date(property.value as string));

    case PropertyValueTypes.Integer:
    case PropertyValueTypes.Number:
      return n(property.value as number);

    default:
      return property.value as string;
  }
}

export function getPropertiesGroupedByName(items: Property[], type?: PropertyType): Record<string, Property> {
  return items.reduce<Record<string, Property>>((propertiesByName, item) => {
    if (
      item.hidden ||
      (type && type !== item.propertyType) ||
      item.value === void 0 ||
      (item.value === null && item.propertyValueType !== PropertyValueTypes.Boolean)
    ) {
      return propertiesByName;
    }

    const value: string | null | undefined = getPropertyValue(item);

    if (propertiesByName[item.name]) {
      propertiesByName[item.name].value += `, ${value}`;
    } else {
      propertiesByName[item.name] = { ...item, value, label: item.label || item.name };
    }

    return propertiesByName;
  }, {});
}
