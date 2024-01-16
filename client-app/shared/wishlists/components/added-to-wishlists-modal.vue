<template>
  <VcPopup :title="$t('shared.wishlists.added_to_wishlists_dialog.title', listIds.length)" variant="success">
    <div class="max-h-[50vh] overflow-y-auto border-b px-6 py-8 lg:max-h-64">
      <div class="flex grow items-center">
        <router-link :to="link">
          <div class="h-20 w-20 shrink-0 border border-gray-100">
            <VcImage
              :src="product.imgSrc"
              :alt="product.name"
              size-suffix="sm"
              class="h-full w-full object-cover object-center"
              lazy
            />
          </div>
        </router-link>

        <div class="ml-4 grow">
          <router-link :to="link" class="line-clamp-2 text-sm font-extrabold text-[color:var(--color-link)]">
            {{ product.name }}
          </router-link>

          <p class="mt-1 text-sm md:hidden">
            <span class="font-bold">{{ $t("shared.wishlists.added_to_wishlists_dialog.sku_label") }}:</span>
            {{ product.code }}
          </p>
        </div>

        <VcPriceDisplay
          :value="product.price?.actual"
          class="ml-8 hidden text-sm font-extrabold text-green-700 md:block"
        />
      </div>
    </div>

    <template #actions="{ close }">
      <VcButton variant="outline" @click="close">
        {{ $t("shared.wishlists.added_to_wishlists_dialog.continue_shopping_button") }}
      </VcButton>

      <VcButton
        :to="listIds.length === 1 ? { name: 'ListDetails', params: { listId: listIds[0] } } : { name: 'Lists' }"
        @click="close"
      >
        {{ $t("shared.wishlists.added_to_wishlists_dialog.view_your_list_button", listIds.length) }}
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getProductRoute } from "@/core/utilities";
import type { Product } from "@/core/api/graphql/types";
import type { PropType } from "vue";
import type { RouteLocationRaw } from "vue-router";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },

  listIds: {
    type: Array as PropType<string[]>,
    required: true,
  },
});

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));
</script>
