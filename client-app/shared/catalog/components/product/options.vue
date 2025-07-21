<template>
  <ProductTitledBlock :title="model.title || 'Options'" icon="collection" class="options">
    <div class="options__container">
      <div v-for="[key, property] in properties" :key="key" class="options__item">
        <div class="options__label">{{ property.label }}</div>

        <VcVariantPickerGroup>
          <VcVariantPicker
            v-for="option in property.values"
            :key="option.label"
            :model-value="isSelected(property.name, option.value) ? String(option.value) : undefined"
            type="text"
            :name="property.label"
            :value="String(option.value)"
            :is-available="!isInactive(property.name, option.value)"
            class="options__picker"
            size="xs"
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
  };
  variations: Product[];
  fetchingVariations?: boolean;
}

const props = defineProps<IProps>();
const variations = toRef(props, "variations");

const { properties, select, isSelected, isInactive } = useProductVariationProperties(variations);
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
}
</style>
