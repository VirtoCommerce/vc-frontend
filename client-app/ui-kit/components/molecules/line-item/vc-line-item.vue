<template>
  <div class="border-b">
    <div class="flex p-5 space-x-4 lg:space-x-6">
      <!-- Line item image -->
      <div :class="{ 'opacity-25': !productExists }" class="flex-col border border-gray-100 w-16 h-16">
        <VcImage
          :src="item.imageUrl"
          :alt="item.name"
          size-suffix="sm"
          class="w-full h-full object-cover object-center"
          lazy
        />
      </div>

      <!-- Line item name, props, prices -->
      <div class="flex-col">
        <div class="{ 'opacity-25': !productExists }">
          <div>
            <router-link
              :to="link"
              v-if="link"
              class="text-[color:var(--color-link)] font-extrabold line-clamp-3 overflow-hidden"
              :title="item.name"
            >
              {{ item.name }}
            </router-link>
            <div class="font-extrabold line-clamp-3 overflow-hidden" v-else>
              {{ item.name }}
            </div>
          </div>

          <div v-if="brandExists">
            <span class="font-medium lg:font-extrabold text-gray-500 lg:text-black pr-1">
              {{ $t("shared.checkout.product_card.brand_label") }}
            </span>
            <span class="h-4 mx-2 border-b-2 flex-1 border-gray-100 border-dotted lg:hidden" />
            <span class="w-1/3 lg:w-auto font-bold lg:font-medium">{{ item.product?.brandName }}</span>
          </div>

          <div>
            <slot name="prices" />
          </div>
        </div>
      </div>

      <!-- Line item quantity -->
      <div class="flex-col">
        <slot name="quantity" />
      </div>

      <!-- Line item totals -->
      <div class="flex-col">
        <slot name="totals" />
      </div>

      <!-- Remove button -->
      <div class="flex-col" v-if="!readOnly">
        <button
          :title="$t('shared.checkout.product_card.remove_button')"
          type="button"
          class="h-7 w-7 shadow rounded text-[color:var(--color-danger)] hover:bg-gray-100"
          @click="$emit('remove:item', item.id)"
        >
          <i class="fas fa-times" />
        </button>

        <VcButton
          size="sm"
          kind="secondary"
          is-outline
          class="uppercase px-2"
          v-if="isMobile"
          @click="$emit('remove:item', item.id)"
        >
          {{ $t("shared.checkout.product_card.remove_button") }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import { RouteLocationRaw } from "vue-router";
import { breakpointsTailwind, computedEager, useBreakpoints } from "@vueuse/core";
import { LineItemType, OrderLineItemType, QuoteItemType } from "@/xapi";
import { getProductRoute } from "@/core";

const props = defineProps({
  item: {
    type: Object as PropType<QuoteItemType | OrderLineItemType | LineItemType>,
    required: true,
  },

  readOnly: {
    type: Boolean,
  },
});

defineEmits(["remove:item"]);

const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smaller("lg");

const productExists = computedEager<boolean>(() => !!props.item.product);
const brandExists = computedEager<boolean>(() => !!props.item.product?.brandName);

const link = computed<RouteLocationRaw>(() => getProductRoute(props.item!.productId!, props.item!.product!.slug));
</script>
