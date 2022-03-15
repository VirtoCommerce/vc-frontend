<template>
  <!-- Mobile view -->
  <div v-if="isMobile" class="border-b">
    <div class="flex flex-col p-5">
      <div class="flex overflow-hidden space-x-5 items-center justify-between mb-4">
        <div class="w-16 h-16 flex-shrink-0">
          <VcImage :src="productItem.imgSrc" :alt="productItem.name" class="w-full h-full object-cover object-center" />
        </div>
        <div class="text-sm">
          <router-link
            :to="`/${SeoUrl.Product}/${productItem.id}`"
            class="text-cyan-700 font-extrabold line-clamp-3 overflow-hidden"
            @click="$emit('close-popup')"
          >
            {{ productItem.name }}
          </router-link>
          <div
            class="flex items-center space-x-1"
            v-if="(props.productItem.quantity! > props.productItem.availabilityData?.availableQuantity) && !isInputDisabled"
          >
            <i class="fas fa-exclamation-circle text-yellow-500 self-start mt-1"></i>
            <span class="text-xs text-gray-400">
              The number of items in the order was
              <span class="text-gray-500"
                >reduced from {{ props.productItem.quantity }} to
                {{ props.productItem.availabilityData?.availableQuantity }}</span
              >
              due to stock restrictions
            </span>
          </div>
          <div class="flex items-center space-x-1" v-else-if="!props.productItem.availabilityData?.isAvailable">
            <i class="fas fa-exclamation-circle text-yellow-500 self-start mt-1"></i>
            <span class="text-xs text-gray-400" v-if="!isOutOfStock"> Item can't be purchased </span>
            <span class="text-xs text-gray-400" v-else> Item is out of stock </span>
          </div>
        </div>
      </div>
      <div class="flex justify-between">
        <div class="flex items-center space-x-3">
          <span class="self-start">Quantity:</span>
          <div class="flex flex-col items-center">
            <input
              v-model="value"
              type="number"
              pattern="\d*"
              :max="maxQty"
              :min="minQty"
              class="w-20 border rounded overflow-hidden h-8 focus:ring ring-inset outline-none p-1 text-center"
              :class="{ 'text-red-500': isInputDisabled, 'border-red-500': errorMessage }"
              :disabled="isInputDisabled || readOnly"
              @input="onInput"
              @keypress="onKeypress"
            />
            <div>
              <div v-if="!isInputDisabled" class="flex items-center">
                <span
                  class="text-xs pt-1 whitespace-nowrap"
                  :class="
                    productItem.quantity! > productItem.availabilityData?.availableQuantity
                      ? 'text-yellow-500'
                      : 'text-green-700'
                  "
                  >{{
                    productItem.availabilityData?.availableQuantity > 9999
                      ? "9999+"
                      : productItem.availabilityData?.availableQuantity
                  }}
                  in stock</span
                >
              </div>
              <div v-else-if="isOutOfStock" class="flex items-center">
                <span class="text-red-500 text-xs pt-1 whitespace-nowrap">Out of stock</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex text-sm items-start space-x-3">
          <span class="mt-1">Total:</span>
          <span class="text-green-700 font-extrabold mt-1">{{ currency?.symbol }}{{ total }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Desktop view -->
  <div v-else class="border-b">
    <div class="p-5 flex flex-wrap overflow-hidden space-x-4 lg:space-x-6">
      <div class="w-16 h-16">
        <VcImage :src="productItem.imgSrc" :alt="productItem.name" class="w-full h-full object-cover object-center" />
      </div>

      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center flex-1">
        <div class="mb-3 lg:mb-0 text-sm xl:w-1/2">
          <router-link
            :to="`/${SeoUrl.Product}/${productItem.id}`"
            class="text-cyan-700 font-extrabold line-clamp-3 overflow-hidden"
            @click="$emit('close-popup')"
          >
            {{ productItem.name }}
          </router-link>
          <div
            class="flex items-center space-x-1"
            v-if="(props.productItem.quantity! > props.productItem.availabilityData?.availableQuantity) && !isInputDisabled"
          >
            <i class="fas fa-exclamation-circle text-yellow-500 self-start mt-1"></i>
            <span class="text-xs text-gray-400">
              The number of items in the order was
              <span class="text-gray-500"
                >reduced from {{ props.productItem.quantity }} to
                {{ props.productItem.availabilityData?.availableQuantity }}</span
              >
              due to stock restrictions
            </span>
          </div>
          <div class="flex items-center space-x-1" v-else-if="!props.productItem.availabilityData?.isAvailable">
            <i class="fas fa-exclamation-circle text-yellow-500 self-start mt-1"></i>
            <span class="text-xs text-gray-400" v-if="!isOutOfStock"> Item can't be purchased </span>
            <span class="text-xs text-gray-400" v-else> Item is out of stock </span>
          </div>
        </div>

        <div class="flex items-start space-x-2 lg:space-x-4 xl:w-2/5 justify-between lg:justify-end">
          <div class="flex flex-col items-center lg:w-24 lg:shrink-0 xl:w-1/4">
            <input
              v-model="value"
              type="number"
              pattern="\d*"
              :max="maxQty"
              :min="minQty"
              class="w-20 border rounded overflow-hidden h-8 lg:h-10 focus:ring ring-inset outline-none p-1 text-center"
              :class="{ 'text-red-500': isInputDisabled, 'border-red-500': errorMessage }"
              :disabled="isInputDisabled || readOnly"
              @input="onInput"
              @keypress="onKeypress"
            />
            <div>
              <div v-if="!isInputDisabled" class="flex items-center">
                <span
                  class="text-xs pt-1 whitespace-nowrap"
                  :class="
                    productItem.quantity! > productItem.availabilityData?.availableQuantity
                      ? 'text-yellow-500'
                      : 'text-green-700'
                  "
                  >{{
                    productItem.availabilityData?.availableQuantity > 9999
                      ? "9999+"
                      : productItem.availabilityData?.availableQuantity
                  }}
                  in stock</span
                >
              </div>
              <div v-else-if="isOutOfStock" class="flex items-center">
                <span class="text-red-500 text-xs pt-1 whitespace-nowrap">Out of stock</span>
              </div>
            </div>
          </div>

          <div class="hidden md:flex lg:w-28 lg:shrink-0 xl:w-2/4 md:items-end flex-col text-sm font-extrabold pr-3">
            <span class="text-black self-end">Total</span>
            <span class="text-green-700">{{ currency?.symbol }}{{ total }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@/components";
import { computed, PropType } from "vue";
import { useField } from "vee-validate";
import * as yup from "yup";
import SeoUrl from "@core/seo-routes.enum";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useCart } from "@/shared/cart";
import { Product as ProductType } from "@/core/api/graphql/types";

// Define max qty available to add
const max = 999999;

const props = defineProps({
  productItem: {
    type: Object as PropType<
      ProductType & {
        quantity: number | undefined;
        lineItemId: string | undefined;
      }
    >,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close-popup"]);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const { currency } = useCart();

const variation = computed(() => props.productItem.variations?.find((v) => v.id === props.productItem.id));
const minQty = computed(() => (variation.value ? variation.value?.minQuantity : props.productItem.minQuantity) || 0);
const maxQty = computed(() => (variation.value ? variation.value?.maxQuantity : props.productItem.maxQuantity) || max);

const total = computed(() => (value.value * props.productItem.price?.actual?.amount).toFixed(2));

let rules = yup.number().integer().optional().moreThan(0);
rules = rules.min(minQty.value);

if (props.productItem.availabilityData?.availableQuantity) {
  rules = rules.max(Math.min(props.productItem.availabilityData.availableQuantity, maxQty.value, max));
}

const isInputDisabled = computed(
  () => !props.productItem.availabilityData?.isInStock || !props.productItem.availabilityData?.isAvailable
);

const isOutOfStock = computed(() => !props.productItem.availabilityData?.isInStock);

const { value, validate, errorMessage } = useField("qty", rules, {
  initialValue: isInputDisabled.value
    ? 0
    : props.productItem.quantity! > props.productItem.availabilityData?.availableQuantity
    ? props.productItem.availabilityData?.availableQuantity
    : props.productItem.quantity,
});

validate();

const updateQuantity = () => {
  if (props.productItem.quantity !== value.value) {
    return { productId: props.productItem.id, quantity: value.value };
  }
};

defineExpose({ updateQuantity });

/**
 * Ignore non-numeric keys.
 */
const onKeypress = (event: KeyboardEvent) => {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
};

/**
 * Limit max value.
 */
const onInput = () => {
  if (value.value && value.value > max) {
    value.value = max;
  }
  if (!value.value) {
    value.value = undefined;
  }
};
</script>

<style scoped></style>
