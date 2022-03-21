<template>
  <div class="flex items-center justify-between bg-white rounded border p-4 shadow-sm hover:shadow-lg space-x-6">
    <div class="flex flex-grow items-center">
      <!-- Product image -->
      <router-link :to="`/${SeoUrl.Product}/${product.id}`" class="cursor-pointer">
        <div class="border border-gray-100 w-20 h-20 flex-shrink-0 mr-4">
          <VcImage :src="product.imgSrc" :alt="product.name" class="w-full h-full object-cover object-center" lazy />
        </div>
      </router-link>

      <div>
        <!-- Product title -->
        <router-link
          :to="`/${SeoUrl.Product}/${product.id}`"
          class="text-[color:var(--color-link)] font-extrabold text-sm mb-3 flex-grow line-clamp-2 overflow-hidden"
        >
          {{ product.name }}
        </router-link>

        <AddToCompare v-if="$cfg.product_compare_enabled" :product="product" class="inline-flex" />
      </div>
    </div>

    <!-- Product props -->
    <div class="hidden xl:block text-sm flex-shrink-0 w-20">
      <div class="font-bold text-xs" v-t="'shared.catalog.product_card.product_sku_label'"></div>
      <div class="text-[color:var(--color-link)] truncate">{{ product.code }}</div>
    </div>

    <div class="hidden xl:block text-sm flex-shrink-0 w-24">
      <div class="font-bold text-xs" v-t="'shared.catalog.product_card.manufacture_model_label'"></div>
      <div class="text-[color:var(--color-link)] truncate">-</div>
    </div>

    <!-- Product price -->
    <div class="text-sm flex-shrink-0 w-28">
      <div class="font-bold text-xs" v-t="'shared.catalog.product_card.price_label'"></div>
      <div class="">
        <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="product.price?.actual" /></span>
        {{ $t("common.suffixes.per_item") }}
      </div>
    </div>

    <!-- VcCard widget -->
    <div class="flex-shrink-0 w-48">
      <slot name="cart-handler"></slot>

      <div v-if="product.availabilityData?.isInStock" class="flex items-center text-green-700 text-xs mt-3">
        <div class="w-1.5 h-1.5 bg-green-700 rounded mr-1"></div>
        {{ product.availabilityData.availableQuantity > 9999 ? "9999+" : product.availabilityData.availableQuantity }}
        {{ $t("common.suffixes.product_count_in_stock") }}
      </div>
      <div v-else class="flex items-center text-[color:var(--color-danger)] text-xs mt-3">
        <div class="w-1.5 h-1.5 bg-[color:var(--color-danger)] rounded mr-1"></div>
        {{ $t("common.messages.product_out_of_stock") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { VcImage, VcPriceDisplay } from "@/components";
import { AddToCompare } from "@/shared/compare";
import { Product as ProductType } from "@/core/api/graphql/types";
import SeoUrl from "@core/seo-routes.enum";

defineProps({
  product: {
    type: Object as PropType<ProductType>,
    required: true,
  },
});
</script>
