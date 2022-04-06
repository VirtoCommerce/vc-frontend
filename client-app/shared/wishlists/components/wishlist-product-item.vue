<template>
  <div class="flex items-center gap-x-8 pt-3 pb-5 py-3 px-6">
    <!-- Name and image -->
    <div class="relative shrink-0 w-full flex-1 flex space-x-3 items-center">
      <div class="border border-gray-100 w-16 h-16 shrink-0">
        <VcImage
          :src="lineItem.product?.imgSrc"
          :alt="lineItem.name"
          class="w-full h-full object-cover object-center"
        />
      </div>
      <router-link
        :to="`/${SeoUrl.Product}/${lineItem.product?.id}`"
        class="text-sm text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)] break-words font-extrabold line-clamp-3 overflow-hidden"
      >
        {{ lineItem.name }}
      </router-link>
    </div>

    <!-- Price -->
    <div class="shrink-0 w-32 font-bold text-sm flex flex-col items-start">
      <span class="font-bold">
        {{ $t("pages.compare.main_block.price_label") }}
      </span>
      <div>
        <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="lineItem.product?.price?.actual" /></span>
        {{ $t("common.suffixes.per_item") }}
      </div>
    </div>

    <!-- Add to cart -->
    <div class="w-48 shrink-0 flex flex-col justify-center">
      <AddToCart :product="lineItem.product!" />
      <div v-if="lineItem.product?.availabilityData?.isInStock" class="flex items-center text-green-700 text-xs">
        <div class="w-1.5 h-1.5 bg-green-700 rounded mr-1"></div>
        {{
          lineItem.product.availabilityData.availableQuantity > 9999
            ? "9999+"
            : lineItem.product.availabilityData.availableQuantity
        }}
        {{ $t("common.suffixes.product_count_in_stock") }}
      </div>

      <div v-else class="flex items-center text-[color:var(--color-danger)] text-xs">
        <div class="w-1.5 h-1.5 bg-[color:var(--color-danger)] rounded mr-1"></div>
        {{ $t("common.messages.product_out_of_stock") }}
      </div>
    </div>

    <!-- Actions -->
    <div class="shrink-0 ml-auto">
      <button
        type="button"
        class="h-7 w-7 shadow rounded text-[color:var(--color-danger)] bg-white hover:bg-gray-100"
        :title="$t('shared.wishlists.list_card.remove_list_button')"
        @click="$emit('remove')"
      >
        <i class="fas fa-times" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { VcImage, VcPriceDisplay } from "@/components";
import { AddToCart } from "@/shared/cart";
import { LineItemType } from "@core/api/graphql/types";
import SeoUrl from "@core/seo-routes.enum";

defineEmits(["remove"]);

defineProps({
  lineItem: {
    type: Object as PropType<LineItemType>,
    required: true,
  },
});
</script>
