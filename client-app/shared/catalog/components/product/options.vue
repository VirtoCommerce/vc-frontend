<template>
  <ProductTitledBlock
    v-if="isBlockVisible"
    :title="model.title || $t('shared.catalog.product_details.options.title')"
    icon="collection"
    class="options"
  >
    <div class="options__container">
      <div v-if="fetchingVariations" class="options__skeleton">
        <div class="options__skeleton-item">
          <div class="options__skeleton-item-label" />

          <div class="options__skeleton-item-picker-group">
            <div v-for="i in 3" :key="i" class="options__skeleton-item-picker" />
          </div>
        </div>
      </div>

      <div v-for="[key, property] in properties" v-else :key="key" class="options__item">
        <div class="options__label">{{ property.label }}</div>

        <VcVariantPickerGroup
          :model-value="getSelectedValue(property)"
          :type="getType(property.propertyValueType)"
          :name="property.label"
          size="xs"
          @update:model-value="(value: string | string[]) => handlePropertyChange(property, value)"
        >
          <VcVariantPicker
            v-for="option in property.values"
            :key="`${property.name}-${serialize(option.value)}`"
            :value="getValue(property, option)"
            :is-available="isAvailable(property.name, option.value)"
            class="options__picker"
            :tooltip="getTooltip(property, option)"
          />
        </VcVariantPickerGroup>
      </div>
    </div>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { PropertyValueTypes } from "@/core/api/graphql/types";
import { useProductVariationProperties } from "@/shared/catalog/composables/useProductVariationProperties";
import { serialize } from "@/ui-kit/utilities";
import type { Product } from "@/core/api/graphql/types";
import type { IProperty, IPropertyValue } from "@/shared/catalog/composables/useProductVariationProperties";
import ProductTitledBlock from "@/shared/catalog/components/product-titled-block.vue";

interface IProps {
  model: {
    title: string;
    hidden?: boolean;
  };
  variations: Product[];
  fetchingVariations?: boolean;
}

const props = defineProps<IProps>();
const variations = toRef(props, "variations");
const fetchingVariations = toRef(props, "fetchingVariations");

const isBlockVisible = computed(() => !props.model.hidden && (properties.value.size > 0 || fetchingVariations.value));

const { properties, select, isAvailable, getTooltip, getSelectedValue } = useProductVariationProperties(variations);

function getType(propertyValueType: PropertyValueTypes): "color" | "text" {
  return propertyValueType === PropertyValueTypes.Color ? "color" : "text";
}

function getValue(property: IProperty, option: IPropertyValue): string | string[] {
  return option.value;
}

function handlePropertyChange(property: IProperty, groupValue: string | string[]) {
  if (groupValue && !(Array.isArray(groupValue) && groupValue.length === 0)) {
    select(property.name, groupValue);
  }
}
</script>

<style lang="scss">
.options {
  &__container {
    @apply flex flex-col gap-5;
  }

  &__item {
    @apply flex flex-col gap-2;
  }

  &__label {
    @apply text-sm font-bold;
  }

  &__skeleton {
    @apply flex flex-col gap-5;
  }

  &__skeleton-item {
    @apply flex flex-col gap-2;
  }

  &__skeleton-item-label {
    @apply h-4.5 w-20 rounded-md bg-neutral-200 animate-pulse;
  }

  &__skeleton-item-picker-group {
    @apply flex gap-2;
  }

  &__skeleton-item-picker {
    @apply h-9 w-24 rounded-md bg-neutral-100 animate-pulse;

    &:nth-child(2) {
      @apply w-20;
    }

    &:nth-child(3) {
      @apply w-32;
    }
  }
}
</style>
