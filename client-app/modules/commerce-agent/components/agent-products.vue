<template>
  <section class="agent-products">
    <h3 v-if="payload.title" class="agent-products__title">{{ payload.title }}</h3>

    <ul class="agent-products__list">
      <li v-for="pick in payload.items" :key="pick.product.product_id" class="agent-products__item">
        <VcImage
          class="agent-products__image"
          :src="pick.product.image_url"
          :alt="pick.product.title"
          lazy
          size-suffix="md"
        />

        <div class="agent-products__body">
          <p class="agent-products__name">{{ pick.product.title }}</p>

          <p class="agent-products__price">{{ formatPrice(pick.product) }}</p>

          <p v-if="pick.reason" class="agent-products__reason">{{ pick.reason }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useLanguages } from "@/core/composables/useLanguages";
import type { IAgentProduct, IAgentProductsPayload } from "../types";

interface IProps {
  payload: IAgentProductsPayload;
}

defineProps<IProps>();

const { currentLanguage } = useLanguages();

function formatPrice(product: IAgentProduct): string {
  return new Intl.NumberFormat(currentLanguage.value?.cultureName, {
    style: "currency",
    currency: product.currency || "USD",
  }).format(product.price);
}
</script>

<style lang="scss">
.agent-products {
  $self: &;

  @apply flex flex-col gap-3;

  &__title {
    @apply text-base font-bold;
  }

  &__list {
    @apply grid grid-cols-2 gap-3;

    @media (min-width: theme("screens.md")) {
      @apply grid-cols-4;
    }
  }

  &__item {
    @apply flex flex-col rounded border border-neutral-200 bg-additional-50 p-3;
  }

  &__image {
    @apply aspect-square w-full object-contain;
  }

  &__body {
    @apply mt-2 flex flex-col gap-1;
  }

  &__name {
    @apply line-clamp-2 text-sm font-bold;
  }

  &__price {
    @apply text-sm tabular-nums;
  }

  &__reason {
    @apply text-xs text-neutral-600;
  }
}
</style>
