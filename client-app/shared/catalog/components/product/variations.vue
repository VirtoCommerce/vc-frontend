<template>
  <VcWidget
    v-if="!model.hidden && product.variations?.length"
    class="variations"
    size="lg"
    :title="model.title || $t('shared.catalog.product_details.variations.title')"
    prepend-icon="cube"
  >
    <div v-if="!isSmallScreen" class="variations__views">
      <button type="button" class="variations__view" :disabled="!isTableView" @click="toggleView">
        <VcIcon name="list" class="variations__icon" />

        {{ $t("shared.catalog.product_details.variations.list") }}
      </button>

      <button type="button" class="variations__view" :disabled="isTableView" @click="toggleView">
        <VcIcon name="table" class="variations__icon" />

        {{ $t("shared.catalog.product_details.variations.table") }}
      </button>
    </div>

    <VariationsDefault v-if="isSmallScreen || (!isSmallScreen && !isTableView)" :product="product" />

    <VariationsTable v-else :product="product" />
  </VcWidget>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { ref } from "vue";
import { BREAKPOINTS } from "@/core/constants";
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

const breakpoints = useBreakpoints(BREAKPOINTS);

const isTableView = ref(false);
const isSmallScreen = breakpoints.smaller("xl");

function toggleView() {
  isTableView.value = !isTableView.value;
}
</script>

<style lang="scss">
.variations {
  &__views {
    @apply mb-6 space-x-3;
  }

  &__view {
    @apply p-2 rounded bg-transparent text-sm text-neutral font-bold;

    &:hover {
      @apply bg-neutral-50;
    }

    &:disabled {
      @apply bg-neutral-100 text-neutral-950;
    }
  }

  &__icon {
    @apply me-1 size-5;

    *:disabled > & {
      @apply text-primary;
    }
  }
}
</style>
