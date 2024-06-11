<template>
  <VcWidget
    v-if="!model.hidden && product.variations?.length"
    class="variations"
    size="lg"
    :title="model.title || $t('shared.catalog.product_details.variations.title')"
    prepend-icon="cube"
  >
    <div class="variations__views" role="group">
      <button type="button" class="variations__view" :disabled="!isTableView" @click="toggleView">
        <VcIcon name="list" class="variations__icon" />

        {{ $t("shared.catalog.product_details.variations.list") }}
      </button>

      <button type="button" class="variations__view" :disabled="isTableView" @click="toggleView">
        <VcIcon name="table" class="variations__icon" />

        {{ $t("shared.catalog.product_details.variations.table") }}
      </button>
    </div>

    <VariationsDefault v-if="!isTableView" :product="product" />

    <VariationsTable v-else :product="product" />
  </VcWidget>
</template>

<script setup lang="ts">
import { ref } from "vue";
import VariationsDefault from "./variations-default.vue";
import VariationsTable from "./variations-table.vue";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

defineProps<IProps>();

const isTableView = ref(false);

function toggleView() {
  isTableView.value = !isTableView.value;
}
</script>

<style lang="scss">
.variations {
  &__views {
    @apply space-y-2;
  }

  &__view {
    @apply mb-6 p-2 rounded bg-transparent text-sm text-neutral font-bold;

    &:hover {
      @apply bg-neutral-50;
    }

    &:disabled {
      @apply bg-neutral-100 text-neutral-950;
    }
  }

  &__icon {
    @apply size-5;

    *:disabled > & {
      @apply text-primary;
    }
  }
}
</style>
