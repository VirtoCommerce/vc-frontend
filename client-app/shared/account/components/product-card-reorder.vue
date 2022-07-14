<template>
  <!-- Mobile view -->
  <div v-if="isMobile" class="border-b">
    <div class="flex flex-col p-5">
      <div class="flex overflow-hidden space-x-5 items-center mb-4">
        <div class="w-16 h-16 flex-shrink-0">
          <VcImage
            :src="productItem.imgSrc"
            :alt="productItem.name"
            size-suffix="sm"
            class="w-full h-full object-cover object-center"
            lazy
          />
        </div>
        <div class="text-sm">
          <router-link
            v-if="!isProductDeleted"
            :to="link"
            target="_blank"
            class="text-[color:var(--color-link)] font-extrabold line-clamp-3 overflow-hidden"
          >
            {{ productItem.name }}
          </router-link>
          <div v-else class="font-extrabold line-clamp-3 overflow-hidden">
            {{ productItem.name }}
          </div>
          <div
            v-if="(props.productItem.quantity! > props.productItem.availabilityData?.availableQuantity) && !isInputDisabled"
            class="flex items-center space-x-1"
          >
            <i class="fas fa-exclamation-circle text-[color:var(--color-primary)] self-start mt-1"></i>
            <span
              v-html="
                $t('shared.account.reorder_info_popup.product_card.reduced_message', [
                  props.productItem.quantity,
                  props.productItem.availabilityData?.availableQuantity,
                ])
              "
              class="text-xs text-gray-400"
            >
            </span>
          </div>
          <div v-else-if="!props.productItem.availabilityData?.isAvailable" class="flex items-center space-x-1">
            <i class="fas fa-exclamation-circle text-[color:var(--color-primary)] self-start mt-1"></i>
            <span class="text-xs text-gray-400">{{
              !isOutOfStock || isProductDeleted
                ? $t("shared.account.reorder_info_popup.product_card.item_can_t_be_purchased_message")
                : $t("shared.account.reorder_info_popup.product_card.item_is_out_of_stock_message")
            }}</span>
          </div>
        </div>
      </div>
      <div class="flex justify-between">
        <div class="flex items-center space-x-3">
          <span class="self-start">
            {{ $t("shared.account.reorder_info_popup.product_card.quantity_label") }}
          </span>
          <div class="flex flex-col items-center">
            <input
              ref="mobileInput"
              v-model="value"
              :max="maxQty"
              :min="minQty"
              :class="{
                'text-[color:var(--color-danger)]': isInputDisabled && !isProductDeleted,
                'border-[color:var(--color-danger)]': errorMessage,
              }"
              :disabled="isInputDisabled || readOnly || isProductDeleted"
              class="w-20 border border-gray-300 rounded overflow-hidden h-8 focus:border-gray-400 outline-none p-1 text-center"
              type="number"
              pattern="\d*"
              @input="onInput"
              @keypress="onKeypress"
              @click="onMobileInputClick"
            />
            <div v-if="!isProductDeleted">
              <div v-if="!isInputDisabled" class="flex items-center">
                <span
                  :class="
                    productItem.quantity! > productItem.availabilityData?.availableQuantity
                      ? 'text-[color:var(--color-primary)]'
                      : 'text-green-700'
                  "
                  class="text-xs pt-1 whitespace-nowrap"
                >
                  {{
                    productItem.availabilityData?.availableQuantity > 9999
                      ? "9999+"
                      : productItem.availabilityData?.availableQuantity
                  }}
                  {{ $t("shared.account.reorder_info_popup.product_card.in_stock_suffix") }}
                </span>
              </div>
              <div v-else-if="isOutOfStock" class="flex items-center">
                <span
                  v-t="'shared.account.reorder_info_popup.product_card.out_of_stock_message'"
                  class="text-[color:var(--color-danger)] text-xs pt-1 whitespace-nowrap"
                ></span>
              </div>
              <div v-else-if="isProductDeleted" class="flex items-center">
                <span class="text-xs pt-1 whitespace-nowrap"></span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!isProductDeleted" class="flex text-sm items-start space-x-3">
          <span class="mt-1">
            {{ $t("shared.account.reorder_info_popup.product_card.total_label") }}
          </span>
          <span class="text-green-700 font-extrabold mt-1">{{ currency?.symbol }}{{ total }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Desktop view -->
  <div v-else class="border-b">
    <div class="p-5 flex flex-wrap overflow-hidden space-x-4 lg:space-x-6">
      <div class="w-16 h-16">
        <VcImage
          :src="productItem.imgSrc"
          :alt="productItem.name"
          size-suffix="sm"
          class="w-full h-full object-cover object-center"
          lazy
        />
      </div>

      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center flex-1">
        <div class="mb-3 lg:mb-0 text-sm xl:w-1/2">
          <router-link
            v-if="!isProductDeleted"
            :to="link"
            target="_blank"
            class="text-[color:var(--color-link)] font-extrabold line-clamp-3 overflow-hidden"
          >
            {{ productItem.name }}
          </router-link>
          <div v-else class="font-extrabold line-clamp-3 overflow-hidden">
            {{ productItem.name }}
          </div>
          <div
            v-if="(props.productItem.quantity! > props.productItem.availabilityData?.availableQuantity) && !isInputDisabled"
            class="flex items-center space-x-1"
          >
            <i class="fas fa-exclamation-circle text-[color:var(--color-primary)] self-start mt-1"></i>
            <span
              class="text-xs text-gray-400"
              v-html="
                $t('shared.account.reorder_info_popup.product_card.reduced_message', [
                  props.productItem.quantity,
                  props.productItem.availabilityData?.availableQuantity,
                ])
              "
            >
            </span>
          </div>
          <!-- todo: extract small alert component https://virtocommerce.atlassian.net/browse/ST-2488 -->
          <div v-else-if="!props.productItem.availabilityData?.isAvailable" class="flex items-center space-x-1">
            <i class="fas fa-exclamation-circle text-[color:var(--color-primary)] self-start mt-1"></i>
            <span class="text-xs text-gray-400"
              >{{
                !isOutOfStock || isProductDeleted
                  ? $t("shared.account.reorder_info_popup.product_card.item_can_t_be_purchased_message")
                  : $t("shared.account.reorder_info_popup.product_card.item_is_out_of_stock_message")
              }}
            </span>
          </div>
        </div>

        <div class="flex items-start space-x-2 lg:space-x-4 xl:w-2/5 justify-between lg:justify-end">
          <div class="flex flex-col items-center lg:w-24 lg:shrink-0 xl:w-1/4">
            <input
              ref="input"
              v-model="value"
              :max="maxQty"
              :min="minQty"
              :class="{
                'text-[color:var(--color-danger)]': isInputDisabled && !isProductDeleted,
                'border-[color:var(--color-danger)]': errorMessage,
              }"
              :disabled="isInputDisabled || readOnly || isProductDeleted"
              class="w-20 border border-gray-300 rounded overflow-hidden h-8 lg:h-10 focus:border-gray-400 outline-none p-1 text-center"
              type="number"
              pattern="\d*"
              @input="onInput"
              @keypress="onKeypress"
              @click="onInputClick"
            />

            <VcInStock
              v-if="!isProductDeleted && (!isInputDisabled || isOutOfStock)"
              :is-in-stock="!isInputDisabled && !isOutOfStock"
              :quantity="productItem.availabilityData?.availableQuantity"
              class="inline-block mt-1.5"
            ></VcInStock>
          </div>

          <div class="hidden md:flex lg:w-28 lg:shrink-0 xl:w-2/4 md:items-end flex-col text-sm font-extrabold pr-3">
            <span v-if="!isProductDeleted" class="text-black self-end">
              {{ $t("shared.account.reorder_info_popup.product_card.total_label") }}
            </span>
            <span v-if="!isProductDeleted" class="text-green-700">{{ currency?.symbol }}{{ total }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { useField } from "vee-validate";
import * as yup from "yup";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useCart } from "@/shared/cart";
import { Product } from "@/xapi/types";
import { RouteLocationRaw } from "vue-router";
import { getProductRoute } from "@/shared/catalog";

// Define max qty available to add
const max = 999999;

const mobileInput = ref<HTMLInputElement>();
const input = ref<HTMLInputElement>();

const props = defineProps({
  productItem: {
    type: Object as PropType<
      Product & {
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

const link = computed<RouteLocationRaw>(() => getProductRoute(props.productItem));

const variation = computed(() => props.productItem.variations?.find((v) => v.id === props.productItem.id));
const minQty = computed(() => (variation.value ? variation.value?.minQuantity : props.productItem.minQuantity) || 0);
const maxQty = computed(() => (variation.value ? variation.value?.maxQuantity : props.productItem.maxQuantity) || max);

const total = computed(() => (value.value! * props.productItem.price?.actual?.amount).toFixed(2));

let rules = yup.number().integer().optional().moreThan(0);
rules = rules.min(minQty.value);

if (props.productItem.availabilityData?.availableQuantity) {
  rules = rules.max(Math.min(props.productItem.availabilityData.availableQuantity, maxQty.value, max));
}

const isInputDisabled = computed(
  () => !props.productItem.availabilityData?.isInStock || !props.productItem.availabilityData?.isAvailable
);

const isOutOfStock = computed(() => !props.productItem.availabilityData?.isInStock);

const isProductDeleted = computed(() => props.productItem.code === "deleted");

const { value, validate, errorMessage } = useField("qty", rules, {
  initialValue: props.productItem.quantity,
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

/**
 * Select input value.
 */
function onInputClick() {
  (input.value as HTMLInputElement).select();
}

/**
 * Select mobile input value.
 */
function onMobileInputClick() {
  (mobileInput.value as HTMLInputElement).select();
}
</script>
