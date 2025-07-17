import { ref, computed, watch, readonly } from "vue";
import { useI18n } from "vue-i18n";
import { PropertyType, PropertyValueTypes } from "@/core/api/graphql/types";
import type { Product, Property } from "@/core/api/graphql/types";
import type { Ref } from "vue";
import type { ComposerTranslation } from "vue-i18n";

type PrimitiveValueType = string | number | boolean | null;

export interface IOptionValue {
  value: PrimitiveValueType;
  label: string;
}

export interface IOption {
  name: string;
  label: string;
  values: IOptionValue[];
}

type SelectedOptionsMapType = ReadonlyMap<string, PrimitiveValueType>;

function isVariationCompatible(variation: Product, propertyName: string, propertyValue: PrimitiveValueType) {
  return variation.properties.some((prop) => prop.name === propertyName && prop.value === propertyValue);
}

function getApplicableVariations(variations: readonly Product[], selected: SelectedOptionsMapType): Product[] {
  const selectedEntries = Array.from(selected.entries());
  if (selectedEntries.length === 0) {
    return [...variations];
  }
  return variations.filter((variation) =>
    selectedEntries.every(([name, value]) => isVariationCompatible(variation, name, value)),
  );
}

function getAvailableOptionValues(variations: readonly Product[]): Map<string, PrimitiveValueType[]> {
  const available = new Map<string, Set<PrimitiveValueType>>();
  for (const variation of variations) {
    for (const prop of variation.properties) {
      if (prop.propertyType !== PropertyType.Variation || !prop.name || prop.value === undefined) {
        continue;
      }
      if (!available.has(prop.name)) {
        available.set(prop.name, new Set());
      }
      available.get(prop.name)?.add(prop.value);
    }
  }

  return new Map(Array.from(available.entries(), ([name, values]) => [name, Array.from(values)]));
}

function runAutoSelection(variations: readonly Product[], selected: SelectedOptionsMapType): SelectedOptionsMapType {
  const newSelected = new Map(selected);
  let changedInLoop = true;

  while (changedInLoop) {
    changedInLoop = false;
    const applicable = getApplicableVariations(variations, newSelected);
    const available = getAvailableOptionValues(applicable);
    for (const [name, values] of available.entries()) {
      if (!newSelected.has(name) && values.length === 1) {
        newSelected.set(name, values[0]);
        changedInLoop = true;
      }
    }
  }
  return newSelected;
}

function calculateNewSelections(
  name: string,
  value: PrimitiveValueType,
  variations: readonly Product[],
  currentSelected: SelectedOptionsMapType,
): SelectedOptionsMapType {
  const baseSelections = new Map<string, PrimitiveValueType>();

  baseSelections.set(name, value);

  for (const [optionName, optionValue] of currentSelected.entries()) {
    if (optionName === name) {
      continue;
    }

    const possibleVariationsAfterBase = getApplicableVariations(variations, baseSelections);

    if (possibleVariationsAfterBase.some((v) => isVariationCompatible(v, optionName, optionValue))) {
      baseSelections.set(optionName, optionValue);
    }
  }

  return runAutoSelection(variations, baseSelections);
}

function getDisplayLabel(property: Property, t: ComposerTranslation): string {
  const { value, propertyValueType } = property;

  switch (propertyValueType) {
    case PropertyValueTypes.Boolean:
      return value ? t("common.labels.true_property") : t("common.labels.false_property");
    case PropertyValueTypes.ShortText:
      return value as string;
    case PropertyValueTypes.LongText:
      return value as string;
    case PropertyValueTypes.Integer:
      return String(value);
    case PropertyValueTypes.Number:
      return String(value);
    case PropertyValueTypes.DateTime:
      return new Date(value as string).toLocaleDateString();
    default:
      return String(value);
  }
}

export function useProductOptions(variations: Ref<readonly Product[]>) {
  const selectedOptions = ref<SelectedOptionsMapType>(new Map());

  const { t } = useI18n();

  const options = computed<Map<string, IOption>>(() => {
    const opts = new Map<string, IOption>();

    const allVariationProps = variations.value
      .flatMap((variation) => variation.properties)
      .filter((property) => property.propertyType === PropertyType.Variation);

    for (const prop of allVariationProps) {
      const { name, value, label } = prop;

      if (!name || value === undefined) {
        continue;
      }

      if (!opts.has(name)) {
        opts.set(name, {
          name,
          label: label,
          values: [],
        });
      }

      const option = opts.get(name)!;
      if (!option.values.some((v) => v.value === value)) {
        option.values.push({ value, label: getDisplayLabel(prop, t) });
      }
    }
    return opts;
  });

  const isCompleted = computed<boolean>(() => {
    if (options.value.size === 0) {
      return false;
    }

    return selectedOptions.value.size === options.value.size;
  });

  const variationResult = computed<Product | undefined>(() => {
    if (!isCompleted.value) {
      return undefined;
    }

    const applicable = getApplicableVariations(variations.value, selectedOptions.value);

    return applicable.length === 1 ? applicable[0] : undefined;
  });

  function isInactive(optionName: string, value: PrimitiveValueType) {
    const selectionsWithoutCurrent = new Map(selectedOptions.value);
    selectionsWithoutCurrent.delete(optionName);

    const possibleVariations = getApplicableVariations(variations.value, selectionsWithoutCurrent);

    return !possibleVariations.some((variation) => isVariationCompatible(variation, optionName, value));
  }

  function select(optionName: string, value: PrimitiveValueType) {
    if (selectedOptions.value.get(optionName) === value) {
      return;
    }
    selectedOptions.value = calculateNewSelections(optionName, value, variations.value, selectedOptions.value);
  }

  watch(
    variations,
    () => {
      selectedOptions.value = new Map();
    },
    { deep: true },
  );

  return {
    options,
    isCompleted,
    variationResult,
    select,
    isSelected: (name: string, value: PrimitiveValueType) => selectedOptions.value.get(name) === value,
    isInactive,
  };
}
