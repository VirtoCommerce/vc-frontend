import { PropertyValueTypes } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { Property, PropertyType, PropertyGroup } from "@/core/api/graphql/types";
import type { NonUndefined } from "utility-types";

interface IGroupedProperties {
  group?: PropertyGroup;
  properties: Property[];
}

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

export function getGroupedAndSortedProperties(source: Property[]): IGroupedProperties[] {
  const { t } = globals.i18n.global;
  const result = new Map<string, IGroupedProperties>();
  const defaultGroup: PropertyGroup = {
    id: "ungrouped",
    name: t("common.labels.other"),
    displayOrder: Infinity,
    description: "",
  };

  let hasValid = false;

  for (const prop of source) {
    const group = prop.group?.id ? prop.group : defaultGroup;

    if (group !== defaultGroup) {
      hasValid = true;
    }

    const entry = result.get(group.id) ?? { group, properties: [] };
    entry.properties.push(prop);
    result.set(group.id, entry);
  }

  if (!hasValid) {
    return [
      {
        properties: source,
      },
    ];
  }

  return Array.from(result.values())
    .sort((a, b) => (a.group?.displayOrder ?? 0) - (b.group?.displayOrder ?? 0))
    .map(({ group, properties }) => {
      const sortedProps = [...properties].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      return { group, properties: sortedProps };
    });
}
