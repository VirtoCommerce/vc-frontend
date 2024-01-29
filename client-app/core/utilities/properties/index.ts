import { globals } from "@/core/globals";
import { PropertyValueType } from "../../enums";
import type { PropertyType } from "../../enums";
import type { Property } from "@/core/api/graphql/types";

export function getPropertyValue(property: Property): string | null | undefined {
  const { t, d, n } = globals.i18n.global;

  if (!property.value) {
    return;
  }

  switch (property.valueType) {
    case PropertyValueType.Boolean:
      return property.value ? t("common.labels.true_property") : t("common.labels.false_property");

    case PropertyValueType.DateTime:
      return d(new Date(property.value));

    case PropertyValueType.Integer:
    case PropertyValueType.DecimalNumber:
      return n(property.value);

    default:
      return property.value;
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

    const value: string | null | undefined = getPropertyValue(item);

    if (propertiesByName[item.name]) {
      propertiesByName[item.name].value += `, ${value}`;
    } else {
      propertiesByName[item.name] = { ...item, value, label: item.label || item.name };
    }

    return propertiesByName;
  }, {});
}
