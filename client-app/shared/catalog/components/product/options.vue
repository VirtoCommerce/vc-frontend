<template>
  <ProductTitledBlock
    v-if="!model.hidden"
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

        <VcVariantPickerGroup>
          <VcVariantPicker
            v-for="option in property.values"
            :key="option.label"
            :model-value="isSelected(property.name, option.value) ? String(option.value) : undefined"
            :type="getType(property)"
            :name="property.label"
            :value="String(option.value)"
            :is-available="isAvailable(property.name, option.value)"
            class="options__picker"
            size="xs"
            :tooltip="getTooltip(property, option)"
            @change="select(property.name, option.value)"
          />
        </VcVariantPickerGroup>
      </div>
    </div>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useProductVariationProperties } from "@/shared/catalog/composables/useProductVariationProperties";
import type { Product } from "@/core/api/graphql/types";
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

const { properties, select, isSelected, isAvailable, getType, getTooltip } = useProductVariationProperties(variations);
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
