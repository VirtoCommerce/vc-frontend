<template>
  <VcProductCard view-mode="item" class="option-product-none">
    <template #media>
      <VcRadioButton value="none" :name="name" :model-value="selected ? 'none' : ''" @input="$emit('input')" />

      <VcProductImage />
    </template>

    <VcProductTitle :title="$t('shared.catalog.product_details.product_configuration.none')" />
  </VcProductCard>
</template>

<script setup lang="ts">
defineEmits<IEmits>();

defineProps<IProps>();

interface IProps {
  name: string;
  selected?: boolean;
}

interface IEmits {
  (e: "input"): void;
}
</script>

<style lang="scss">
.option-product-none {
  &:nth-child(odd) {
    --vc-product-card-bg-color: theme("colors.neutral.50");
  }
}
</style>
