<template>
  <VcProductCard view-mode="item" class="configuration-option-product-none">
    <template #media>
      <VcRadioButton
        value="none"
        :name="`selection-${sectionId}`"
        :model-value="selected ? 'none' : ''"
        @input="$emit('input')"
      />

      <VcProductImage />
    </template>

    <VcProductTitle :title="$t('shared.catalog.product_details.product_configuration.none')" />
  </VcProductCard>
</template>

<script setup lang="ts">
defineEmits<IEmits>();

defineProps<IProps>();

interface IProps {
  sectionId: string;
  selected?: boolean;
}

interface IEmits {
  (e: "input"): void;
}
</script>
