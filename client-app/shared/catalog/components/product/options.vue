<template>
  <ProductTitledBlock :title="model.title" icon="collection">
    <div>content</div>
    {{ variations }}
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { ProductTitledBlock } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  model: {
    title: string;
  };
  variations: Product[];
  fetchingVariations?: boolean;
}

const props = defineProps<IProps>();
const variations = toRef(props, "variations");
</script>
