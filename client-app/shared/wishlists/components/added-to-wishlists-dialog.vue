<template>
  <VcPopup :title="$t('shared.wishlists.added_to_wishlists_dialog.title', listIds.length)" variant="success">
    <div class="max-h-[50vh] lg:max-h-64 overflow-y-auto px-6 py-8 border-b">
      <div class="flex flex-grow items-center">
        <router-link :to="{ name: 'Product', params: { productId: product.id } }">
          <div class="border border-gray-100 w-20 h-20 flex-shrink-0">
            <VcImage :src="product.imgSrc" :alt="product.name" class="w-full h-full object-cover object-center" lazy />
          </div>
        </router-link>

        <div class="ml-4">
          <router-link
            :to="{ name: 'Product', params: { productId: product.id } }"
            class="text-[color:var(--color-link)] font-extrabold text-sm flex-grow line-clamp-2"
          >
            {{ product.name }}
          </router-link>

          <p class="md:hidden text-sm mt-1">
            <span class="font-bold">{{ $t("shared.wishlists.added_to_wishlists_dialog.sku_label") }}:</span>
            {{ product.code }}
          </p>
        </div>

        <VcPriceDisplay
          :value="product.price?.actual"
          class="hidden md:block text-green-700 text-sm font-extrabold ml-8"
        />
      </div>
    </div>

    <template #actions="{ close }">
      <VcButton is-outline class="uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-5" @click="close">
        {{ $t("shared.wishlists.added_to_wishlists_dialog.continue_shopping_button") }}
      </VcButton>

      <VcButton
        :to="listIds.length === 1 ? { name: 'ListDetails', params: { listId: listIds[0] } } : { name: 'Lists' }"
        class="uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-5"
        @click="close"
      >
        {{ $t("shared.wishlists.added_to_wishlists_dialog.view_your_list_button", listIds.length) }}
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Product as ProductType } from "@/core/api/graphql/types";
import { VcPopup, VcButton, VcPriceDisplay, VcImage } from "@/components";

defineProps({
  product: {
    type: Object as PropType<ProductType>,
    required: true,
  },

  listIds: {
    type: Array as PropType<string[]>,
    required: true,
  },
});
</script>
