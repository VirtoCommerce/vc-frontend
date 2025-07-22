import { createSharedComposable } from "@vueuse/core";
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { PropertyType, PropertyValueTypes } from "@/core/api/graphql/types";
import type { Product, Property } from "@/core/api/graphql/types";
import type { Ref } from "vue";
import type { ComposerTranslation } from "vue-i18n";

export type PrimitiveValueType = string | number | boolean | null;

export interface IPropertyValue {
  value: PrimitiveValueType;
  label: string;
}

export interface IProperty {
  name: string;
  label: string;
  values: IPropertyValue[];
}

type SelectedPropertiesMapType = ReadonlyMap<string, PrimitiveValueType>;

/** Checks if a single product variation is compatible with a specific property name and value. */
function isVariationCompatible(variation: Product, propertyName: string, propertyValue: PrimitiveValueType) {
  return variation.properties.some((prop) => prop.name === propertyName && prop.value === propertyValue);
}

/** Filters a list of variations to only those that match all currently selected properties. */
function getApplicableVariations(variations: readonly Product[], selected: SelectedPropertiesMapType): Product[] {
  const selectedEntries = Array.from(selected.entries());
  if (selectedEntries.length === 0) {
    return [...variations];
  }
  return variations.filter((variation) =>
    selectedEntries.every(([name, value]) => isVariationCompatible(variation, name, value)),
  );
}

/** From a list of variations, extracts all unique available property values, grouped by property name. */
function getAvailablePropertyValues(variations: readonly Product[]): Map<string, PrimitiveValueType[]> {
  const available = new Map<string, Set<PrimitiveValueType>>();
  variations.forEach((variation) => {
    variation.properties.forEach((prop) => {
      if (prop.propertyType !== PropertyType.Variation || !prop.name || prop.value === undefined) {
        return;
      }
      if (!available.has(prop.name)) {
        available.set(prop.name, new Set());
      }
      available.get(prop.name)?.add(prop.value);
    });
  });

  return new Map(Array.from(available.entries(), ([name, values]) => [name, Array.from(values)]));
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
      if (!newSelected.has(name) && values.length === 1) {
        newSelected.set(name, values[0]);
        changedInLoop = true;
      }
    }
  }
  return newSelected;
}

/** Calculates the new set of selected properties after a user makes a new selection, discarding incompatible previous choices. */
function calculateNewSelections(
  name: string,
  value: PrimitiveValueType,
  variations: readonly Product[],
  currentSelected: SelectedPropertiesMapType,
): SelectedPropertiesMapType {
  const baseSelections = new Map<string, PrimitiveValueType>();

  baseSelections.set(name, value);

  Array.from(currentSelected.entries()).forEach(([propertyName, propertyValue]) => {
    if (propertyName === name) {
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

/** Generates a user-friendly display label for a property based on its value type. */
function getDisplayLabel(property: Property, t: ComposerTranslation): string {
  const { value, propertyValueType } = property;

  switch (propertyValueType) {
    case PropertyValueTypes.Boolean:
      return value ? t("common.labels.true_property") : t("common.labels.false_property");
    case PropertyValueTypes.DateTime:
      return new Date(value as string).toLocaleDateString();
    default:
      return String(value);
  }
}

/** A composable function to manage the selection logic for product variation properties. */
export function _useProductVariationProperties(variations: Ref<readonly Product[]>) {
  const selectedProperties = ref<SelectedPropertiesMapType>(new Map());

  const { t } = useI18n();

  const properties = computed<Map<string, IProperty>>(() => {
    const props = new Map<string, IProperty>();

    const allVariationProps = variations.value
      .flatMap((variation) => variation.properties)
      .filter((property) => property.propertyType === PropertyType.Variation);

    allVariationProps.forEach((prop) => {
      const { name, value, label } = prop;

      if (!name || value === undefined) {
        return;
      }

      if (!props.has(name)) {
        props.set(name, {
          name,
          label: label,
          values: [],
        });
      }

      const property = props.get(name);
      if (property && !property.values.some((v) => v.value === value)) {
        property.values.push({ value, label: getDisplayLabel(prop, t) });
      }
    });

    return props;
  });

  const isCompleted = computed<boolean>(() => {
    if (properties.value.size === 0) {
      return false;
    }

    return selectedProperties.value.size === properties.value.size;
  });

  const variationResult = computed<Product | undefined>(() => {
    if (!isCompleted.value) {
      return undefined;
    }

    const applicable = getApplicableVariations(variations.value, selectedProperties.value);

    return applicable.length === 1 ? applicable[0] : undefined;
  });

  function isAvailable(propertyName: string, value: PrimitiveValueType) {
    const selectionsWithoutCurrent = new Map(selectedProperties.value);
    selectionsWithoutCurrent.delete(propertyName);

    const possibleVariations = getApplicableVariations(variations.value, selectionsWithoutCurrent);

    return possibleVariations.some((variation) => isVariationCompatible(variation, propertyName, value));
  }

  function isSelected(propertyName: string, value: PrimitiveValueType) {
    return selectedProperties.value.get(propertyName) === value;
  }

  function select(propertyName: string, value: PrimitiveValueType) {
    if (selectedProperties.value.get(propertyName) === value) {
      return;
    }
    selectedProperties.value = calculateNewSelections(propertyName, value, variations.value, selectedProperties.value);
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
    select,
    isSelected,
    isAvailable,
  };
}

export const useProductVariationProperties = createSharedComposable(_useProductVariationProperties);
