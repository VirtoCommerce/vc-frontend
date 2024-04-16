import { PropertyValueTypes } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { Property, PropertyType } from "@/core/api/graphql/types";
import type { NonUndefined } from "utility-types";

function hasPropertyValue(property: Property): property is Property & { value: NonUndefined<Property["value"]> } {
  return !(
    property.value === undefined ||
    (property.value === null && property.propertyValueType !== PropertyValueTypes.Boolean)
  );
}

export function getPropertyValue(property: Property): string | null | undefined {
  const { t, d, n } = globals.i18n.global;

  if (!hasPropertyValue(property)) {
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

export function getPropertiesGroupedByName(properties: Property[], type?: PropertyType): Record<string, Property> {
  return properties.reduce<Record<string, Property>>((propertiesByName, property) => {
    if (property.hidden || (type && type !== property.propertyType) || !hasPropertyValue(property)) {
      return propertiesByName;
    }

    const value: string | null | undefined = getPropertyValue(property);

    if (propertiesByName[property.name]) {
      propertiesByName[property.name].value += `, ${value}`;
    } else {
      propertiesByName[property.name] = { ...property, value, label: property.label || property.name };
    }

    return propertiesByName;
  }, {});
}
