import { createSharedComposable } from "@vueuse/core";
import { isEqual, sortBy } from "lodash";
import { ref, computed, watch } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import {
  normalizePropertyValue,
  getVariationPropertiesGroupedByName,
  isMultiColorProperty,
  getPropertyValue,
} from "@/core/utilities/properties";
import { serialize } from "@/ui-kit/utilities";
import type { Product, Property, PropertyValueTypes } from "@/core/api/graphql/types";
import type { Ref } from "vue";

type OptionValueType = string | string[];

export interface IPropertyValue {
  value: OptionValueType;
  label: string;
  displayOrder?: number;
}

export interface IProperty {
  name: string;
  label: string;
  values: IPropertyValue[];
  propertyValueType: PropertyValueTypes;
}

type SelectedPropertiesMapType = ReadonlyMap<string, OptionValueType>;

/** Checks if a single product variation is compatible with a specific property name and value. */
function isVariationCompatible(variation: Product, propertyName: string, propertyValue: OptionValueType) {
  const variationProps = variation.properties.filter((p) => p.name === propertyName);

  if (Array.isArray(propertyValue)) {
    if (variationProps.length !== propertyValue.length) {
      return false;
    }

    const variationNormalizedValues = sortPropertiesByDisplayOrder(variationProps).map(normalizePropertyValue);

    return isEqual(variationNormalizedValues, propertyValue);
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

/** Sorts properties by displayOrder if all values are numeric */
function sortPropertiesByDisplayOrder(props: Property[]): Property[] {
  return hasAllNumericDisplayOrders(props) ? sortBy(props, (p) => p.valueDisplayOrder) : props;
}

/** Extracts option value from properties array */
// eslint-disable-next-line sonarjs/function-return-type -- union type by design
function getOptionValue(props: Property[]): OptionValueType {
  if (!isMultiColorProperty(props)) {
    return normalizePropertyValue(props[0]);
  }

  return sortPropertiesByDisplayOrder(props).map(normalizePropertyValue);
}

/** Gets available options (including multicolors as single options) for each property */
function getAvailableOptions(variations: readonly Product[]): Map<string, OptionValueType[]> {
  const seen = new Map<string, Set<string>>();
  const result = new Map<string, OptionValueType[]>();

  for (const variation of variations) {
    const grouped = getVariationPropertiesGroupedByName(variation.properties, PropertyType.Variation);

    for (const [name, props] of grouped) {
      if (props.length === 0) continue;

      const value = getOptionValue(props);
      const key = serialize(value);
      const seenSet = seen.get(name);

      if (seenSet) {
        if (!seenSet.has(key)) {
          seenSet.add(key);
          result.get(name)!.push(value);
        }
      } else {
        seen.set(name, new Set([key]));
        result.set(name, [value]);
      }
    }
  }

  return result;
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
    const available = getAvailableOptions(applicable);

    for (const [name, options] of available.entries()) {
      if (newSelected.has(name) || options.length !== 1) {
        continue;
      }

      newSelected.set(name, options[0]);
      changedInLoop = true;
    }
  }

  return newSelected;
}

/** Calculates the new set of selected properties after a user makes a new selection, discarding incompatible previous choices. */
function calculateNewSelections(
  name: string,
  value: OptionValueType,
  variations: readonly Product[],
  currentSelected: SelectedPropertiesMapType,
): SelectedPropertiesMapType {
  const baseSelections = new Map<string, OptionValueType>();

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

/** Checks if all properties have valid numeric valueDisplayOrder */
function hasAllNumericDisplayOrders(properties: Property[]): boolean {
  return properties.every((p) => typeof p.valueDisplayOrder === "number" && Number.isFinite(p.valueDisplayOrder));
}

/** Creates multicolor property value option from multiple color properties */
function createMulticolorOption(properties: Property[]): IPropertyValue {
  if (properties.length === 0) {
    throw new Error("createMulticolorOption: properties array cannot be empty");
  }

  const sortedProps = sortPropertiesByDisplayOrder(properties);
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

  function isAvailable(propertyName: string, value: OptionValueType) {
    const selectionsWithoutCurrent = new Map(selectedProperties.value);
    selectionsWithoutCurrent.delete(propertyName);

    const possibleVariations = getApplicableVariations(variations.value, selectionsWithoutCurrent);

    return possibleVariations.some((variation) => isVariationCompatible(variation, propertyName, value));
  }

  function isSelected(propertyName: string, value: OptionValueType) {
    const selected = selectedProperties.value.get(propertyName);

    if (Array.isArray(value) && Array.isArray(selected)) {
      if (value.length !== selected.length) {
        return false;
      }

      return isEqual(value, selected);
    }

    return selected === value;
  }

  function select(propertyName: string, value: OptionValueType) {
    if (isSelected(propertyName, value)) {
      return;
    }

    selectedProperties.value = calculateNewSelections(propertyName, value, variations.value, selectedProperties.value);
  }

  function getTooltip(property: IProperty, option: IPropertyValue) {
    return option.label;
  }

  // eslint-disable-next-line sonarjs/function-return-type -- union type by design
  function getSelectedValue(property: IProperty): OptionValueType {
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
