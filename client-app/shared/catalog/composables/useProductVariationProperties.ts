import { createSharedComposable } from "@vueuse/core";
import { isEqual, sortBy } from "lodash";
import { ref, computed, watch } from "vue";
import { PropertyType, PropertyValueTypes } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import {
  normalizePropertyValue,
  getVariationPropertiesGroupedByName,
  isColorProperty,
  isMultiColorProperty,
  getPropertyValue,
} from "@/core/utilities/properties";
import { serialize } from "@/ui-kit/utilities";
import type { Product, Property } from "@/core/api/graphql/types";
import type { Ref } from "vue";

export interface IPropertyValue {
  value: string | string[];
  label: string;
  displayOrder?: number;
}

export interface IProperty {
  name: string;
  label: string;
  values: IPropertyValue[];
  propertyValueType: PropertyValueTypes;
}

type SelectedPropertiesMapType = ReadonlyMap<string, string | string[]>;

/** Checks if a single product variation is compatible with a specific property name and value. */
function isVariationCompatible(variation: Product, propertyName: string, propertyValue: string | string[]) {
  const variationProps = variation.properties.filter((p) => p.name === propertyName);

  if (Array.isArray(propertyValue)) {
    if (variationProps.length !== propertyValue.length) {
      return false;
    }

    const variationNormalizedValues = sortBy(variationProps.map(normalizePropertyValue));
    const sortedPropertyValue = sortBy(propertyValue);

    return isEqual(variationNormalizedValues, sortedPropertyValue);
  }

  // For single value, variation must have exactly ONE property with this name
  if (variationProps.length !== 1) {
    return false;
  }

  return normalizePropertyValue(variationProps[0]) === propertyValue;
}

/** Filters a list of variations to only those that match all currently selected properties. */
function getApplicableVariations(variations: readonly Product[], selected: SelectedPropertiesMapType): Product[] {
  if (selected.size === 0) {
    return variations as Product[];
  }

  return variations.filter((variation) =>
    Array.from(selected.entries()).every(([name, value]) => isVariationCompatible(variation, name, value)),
  );
}

/** From a list of variations, extracts all unique available property values (as normalized values), grouped by property name. */
function getAvailablePropertyValues(variations: readonly Product[]): Map<string, string[]> {
  const available = new Map<string, Set<string>>();

  variations.forEach((variation) => {
    variation.properties.forEach((prop) => {
      if (prop.propertyType !== PropertyType.Variation || !prop.name) {
        return;
      }

      // Skip null/undefined values, except for Boolean properties where null is valid
      if (prop.value == null && prop.propertyValueType !== PropertyValueTypes.Boolean) {
        return;
      }

      if (!available.has(prop.name)) {
        available.set(prop.name, new Set());
      }

      available.get(prop.name)?.add(normalizePropertyValue(prop));
    });
  });

  return new Map(Array.from(available.entries(), ([name, values]) => [name, Array.from(values)]));
}

/** Finds a property by name in any of the variations */
function findPropertyInVariations(variations: readonly Product[], propertyName: string): Property | undefined {
  for (const variation of variations) {
    const prop = variation.properties.find((p) => p.name === propertyName);
    if (prop) {
      return prop;
    }
  }
  return undefined;
}

/** Automatically selects any property that is the only one remaining based on the current selections. */
function runAutoSelection(
  variations: readonly Product[],
  selected: SelectedPropertiesMapType,
): SelectedPropertiesMapType {
  const newSelected = new Map(selected);
  let changedInLoop = true;

  while (changedInLoop) {
    changedInLoop = false;
    const applicable = getApplicableVariations(variations, newSelected);
    const available = getAvailablePropertyValues(applicable);

    for (const [name, values] of available.entries()) {
      if (newSelected.has(name) || values.length !== 1) {
        continue;
      }

      const prop = findPropertyInVariations(applicable, name);
      if (isColorProperty(prop)) {
        continue;
      }

      newSelected.set(name, values[0]);
      changedInLoop = true;
    }
  }

  return newSelected;
}

/** Calculates the new set of selected properties after a user makes a new selection, discarding incompatible previous choices. */
function calculateNewSelections(
  name: string,
  value: string | string[],
  variations: readonly Product[],
  currentSelected: SelectedPropertiesMapType,
): SelectedPropertiesMapType {
  const baseSelections = new Map<string, string | string[]>();

  baseSelections.set(name, value);

  Array.from(currentSelected.entries()).forEach(([propertyName, propertyValue]) => {
    if (propertyName === name || baseSelections.has(propertyName)) {
      return;
    }

    const possibleVariationsAfterBase = getApplicableVariations(variations, baseSelections);

    if (
      possibleVariationsAfterBase.some((variation) => isVariationCompatible(variation, propertyName, propertyValue))
    ) {
      baseSelections.set(propertyName, propertyValue);
    }
  });

  return runAutoSelection(variations, baseSelections);
}

/** Creates multicolor property value option from multiple color properties */
function createMulticolorOption(properties: Property[]): IPropertyValue {
  if (properties.length === 0) {
    throw new Error("createMulticolorOption: properties array cannot be empty");
  }

  const sortedProps = sortBy(properties, (p) => p.valueDisplayOrder ?? Infinity);
  const valuesArray = sortedProps.map(normalizePropertyValue);
  const labelsArray = sortedProps.map((p) => getPropertyValue(p) ?? "");

  return {
    value: valuesArray,
    label: labelsArray.join(", "),
    displayOrder: sortedProps[0].valueDisplayOrder,
  };
}

/** Creates single property value option from a property */
function createSingleOption(prop: Property): IPropertyValue {
  return {
    value: normalizePropertyValue(prop),
    label: getPropertyValue(prop) ?? "",
    displayOrder: prop.valueDisplayOrder,
  };
}

/** Processes property list and adds options to the property */
function addPropertyOptions(property: IProperty, properties: Property[]): void {
  if (isMultiColorProperty(properties)) {
    const multicolorOption = createMulticolorOption(properties);
    const serializedValues = serialize(multicolorOption.value);

    if (!property.values.some((v) => serialize(v.value) === serializedValues)) {
      property.values.push(multicolorOption);
    }
  } else {
    properties.forEach((prop) => {
      const singleOption = createSingleOption(prop);

      if (!property.values.some((v) => v.value === singleOption.value)) {
        property.values.push(singleOption);
      }
    });
  }
}

/** A composable function to manage the selection logic for product variation properties. */
export function _useProductVariationProperties(variations: Ref<readonly Product[]>) {
  const selectedProperties = ref<SelectedPropertiesMapType>(new Map());
  const { cultureName } = globals;

  const properties = computed<Map<string, IProperty>>(() => {
    const props = new Map<string, IProperty>();

    variations.value.forEach((variation) => {
      const groupedByName = getVariationPropertiesGroupedByName(variation.properties, PropertyType.Variation);

      groupedByName.forEach((propertyList, name) => {
        if (propertyList.length === 0) {
          return;
        }

        const firstProp = propertyList[0];

        if (!props.has(name)) {
          props.set(name, {
            name,
            label: firstProp.label,
            values: [],
            propertyValueType: firstProp.propertyValueType,
          });
        }

        addPropertyOptions(props.get(name)!, propertyList);
      });
    });

    props.forEach((property) => {
      property.values.sort((a, b) => {
        const aOrder = a.displayOrder ?? Infinity;
        const bOrder = b.displayOrder ?? Infinity;

        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }

        return serialize(a.value).localeCompare(serialize(b.value), cultureName, {
          numeric: true,
        });
      });
    });

    return props;
  });

  const isCompleted = computed(() => {
    return properties.value.size > 0 && selectedProperties.value.size === properties.value.size;
  });

  const applicableVariations = computed<Product[]>(() =>
    getApplicableVariations(variations.value, selectedProperties.value),
  );

  const variationResult = computed<Product | undefined>(() =>
    isCompleted.value && applicableVariations.value.length === 1 ? applicableVariations.value[0] : undefined,
  );

  function isAvailable(propertyName: string, value: string | string[]) {
    const selectionsWithoutCurrent = new Map(selectedProperties.value);
    selectionsWithoutCurrent.delete(propertyName);

    const possibleVariations = getApplicableVariations(variations.value, selectionsWithoutCurrent);

    return possibleVariations.some((variation) => isVariationCompatible(variation, propertyName, value));
  }

  function isSelected(propertyName: string, value: string | string[]) {
    const selected = selectedProperties.value.get(propertyName);

    if (Array.isArray(value) && Array.isArray(selected)) {
      if (value.length !== selected.length) {
        return false;
      }

      return isEqual(sortBy(value), sortBy(selected));
    }

    return selected === value;
  }

  function select(propertyName: string, value: string | string[]) {
    if (isSelected(propertyName, value)) {
      return;
    }

    selectedProperties.value = calculateNewSelections(propertyName, value, variations.value, selectedProperties.value);
  }

  function getTooltip(property: IProperty, option: IPropertyValue) {
    return option.label;
  }

  function getSelectedValue(property: IProperty): string | string[] {
    return property.values.find((opt) => isSelected(property.name, opt.value))?.value ?? "";
  }

  watch(
    variations,
    () => {
      selectedProperties.value = new Map();
    },
    { deep: true },
  );

  return {
    properties,
    isCompleted,
    variationResult,
    applicableVariations,

    select,
    isSelected,
    isAvailable,

    getTooltip,
    getSelectedValue,
  };
}

export const useProductVariationProperties = createSharedComposable(_useProductVariationProperties);
