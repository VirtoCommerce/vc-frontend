<template>
  <ProductTitledBlock
    v-if="product.assets?.length"
    class="assets"
    icon="document-text"
    :title="model.title || $t('shared.catalog.product_details.assets_block_title')"
  >
    <ul class="assets__list">
      <li v-for="(file, index) in files" :key="index" class="assets__item">
        <VcFile :file="file" native-download />
      </li>
    </ul>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ProductTitledBlock } from "@/shared/catalog";
import type { Asset, Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  model: { title: string };
}

const props = defineProps<IProps>();

const files = computed<FileType[]>(() =>
  props.product.assets.map((asset: Asset) => {
    return {
      id: asset.id,
      name: asset.name!,
      size: asset.size,
      url: asset.url,
      status: "attached",
      contentType: asset.mimeType,
    };
  }),
);
</script>

<style lang="scss">
.assets {
  &__list {
    @apply px-3 py-4 border border-[--color-neutral-200] rounded space-y-2;
  }
}
</style>
