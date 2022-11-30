<template>
  <div class="border-b md:table-row">
    <div class="md:table-cell md:border-b px-4 py-2.5 align-middle">
      <div class="flex">
        <div :class="{ 'opacity-25': !productExists }" class="flex-col w-16 h-16 border border-gray-100 mr-4">
          <VcImage
            :src="item.imageUrl"
            :alt="item.name"
            size-suffix="sm"
            class="w-full h-full object-cover object-center"
            lazy
          />
        </div>

        <div :class="{ 'opacity-25': !productExists }" class="flex-col flex-1">
          <router-link
            :to="link"
            :title="item.name"
            class="text-[color:var(--color-link)] font-extrabold line-clamp-3"
            v-if="link"
          >
            {{ item.name }}
          </router-link>
          <div class="font-extrabold line-clamp-3" v-else>
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>

    <div class="md:table-cell md:border-b px-4 py-2.5 align-middle">
      <div v-for="property in properties" :key="property.id" class="flex space-y-1 lg:space-y-0">
        <span class="pr-1 w-auto lg:w-1/2 font-medium lg:font-bold">{{ property.name }}:</span>
        <span class="flex-1 w-auto mx-2 h-4 border-b-2 border-gray-200 border-dotted lg:hidden" />
        <span class="font-bold lg:font-medium">{{ property.value }}</span>
      </div>
      <div class="flex space-y-1 lg:space-y-0 lg:hidden" v-if="withPricePerItem">
        <span class="pr-1 w-auto lg:w-1/2 font-medium lg:font-bold">
          {{ $t("shared.line_items.header.price_per_item") }}:
        </span>
        <span class="flex-1 w-auto mx-2 h-4 border-b-2 border-gray-200 border-dotted lg:hidden" />
        <span class="font-bold lg:font-medium">
          <slot name="pricePerItem" />
        </span>
      </div>
    </div>

    <div class="hidden md:table-cell md:border-b md:text-center px-4 py-2.5 align-middle" v-if="withPricePerItem">
      <slot name="pricePerItem" />
    </div>

    <div class="md:table-cell md:border-b md:text-center px-4 py-2.5 align-middle">
      <slot name="quantity" />
    </div>

    <div class="md:table-cell md:border-b md:text-right px-4 py-2.5 align-middle" v-if="withTotal">
      <slot name="total" />
    </div>

    <div class="md:table-cell md:border-b px-4 py-2.5 text-right align-middle" v-if="!readOnly">
      <button
        type="button"
        class="h-7 w-7 shadow rounded text-[color:var(--color-danger)] hover:bg-gray-100"
        @click="$emit('removeItem', item)"
      >
        <i class="fas fa-times" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import { RouteLocationRaw } from "vue-router";
import { computedEager } from "@vueuse/core";
import { LineItemType, OrderLineItemType, Property, QuoteItemType } from "@/xapi";
import { getProductRoute } from "@/core";

const props = defineProps({
  item: {
    type: Object as PropType<QuoteItemType | OrderLineItemType | LineItemType>,
    required: true,
  },

  readOnly: {
    type: Boolean,
  },

  withPricePerItem: {
    type: Boolean,
    default: true,
  },

  withTotal: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["removeItem"]);

const productExists = computedEager<boolean>(() => !!props.item.product);

const link = computed<RouteLocationRaw>(() => getProductRoute(props.item!.productId!, props.item!.product!.slug));
const properties = computed<Property[] | undefined>(() => props.item!.product?.properties?.slice(0, 3));
</script>
