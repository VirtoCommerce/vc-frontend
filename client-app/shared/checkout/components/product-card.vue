<template>
  <div class="border-b">
    <div class="p-5 flex flex-wrap overflow-hidden space-x-4 lg:space-x-6">
      <div class="border border-gray-100 w-16 h-16">
        <VcImage :src="lineItem.imageUrl" :alt="lineItem.name" class="w-full h-full object-cover object-center" />
      </div>

      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center flex-1">
        <div class="mb-3 lg:mb-0 text-sm xl:w-1/2">
          <router-link
            :to="`/${SeoUrl.Product}/${productId}`"
            class="text-[color:var(--color-link)] font-extrabold line-clamp-3 overflow-hidden"
          >
            {{ lineItem.name }}
          </router-link>
          <div class="flex items-center space-x-1 py-1" v-if="validationError">
            <i class="fas fa-exclamation-circle text-[color:var(--color-primary)]"></i>
            <span class="text-xs text-gray-400"> {{ validationError.errorMessage }} </span>
          </div>
          <div class="flex">
            <span class="font-medium text-gray-500 pr-1">{{ $t("shared.checkout.product_card.brand_label") }} </span>
            <span class="mx-2 border-b-2 flex-1 border-gray-100 border-dotted lg:hidden"></span>
            <span class="w-1/3 lg:w-auto font-bold">{{ lineItem.product?.brandName }}</span>
          </div>
          <div class="flex text-sm">
            <span class="font-medium text-gray-500 pr-1">{{ $t("shared.checkout.product_card.price_label") }} </span>
            <span class="mx-2 border-b-2 flex-1 border-gray-100 border-dotted lg:hidden"></span>
            <p class="w-1/3 lg:w-auto font-bold">
              <span class="text-green-700"><VcPriceDisplay :value="lineItem.listPrice || lineItem.placedPrice" /></span>
              <span class="hidden lg:inline" v-t="'common.suffixes.per_item'"></span>
            </p>
          </div>
          <div class="flex text-sm lg:hidden">
            <span class="font-medium text-gray-500">{{ $t("shared.checkout.product_card.total_label") }} </span>
            <span class="mx-2 border-b-2 flex-1 border-gray-100 border-dotted lg:hidden"></span>
            <span class="w-1/3 text-green-700 font-bold"><VcPriceDisplay :value="lineItem.extendedPrice" /></span>
          </div>
        </div>

        <div class="flex items-start space-x-2 lg:space-x-4 xl:w-2/5 lg:justify-end">
          <div class="flex flex-col items-center lg:w-24 lg:shrink-0 xl:w-1/4">
            <input
              v-model="value"
              type="number"
              pattern="\d*"
              :max="maxQty"
              :min="minQty"
              class="w-20 border rounded overflow-hidden h-8 lg:h-10 focus:ring ring-inset outline-none p-1 text-center"
              :class="{
                'text-[color:var(--color-danger)]': isInputDisabled,
                'border-[color:var(--color-danger)]': errorMessage,
              }"
              :disabled="isInputDisabled || readOnly"
              @input="onInput"
              @keypress="onKeypress"
            />
            <div v-if="!readOnly">
              <div v-if="!isInputDisabled" class="flex items-center">
                <span class="text-green-700 text-xs pt-1 whitespace-nowrap"
                  >{{ lineItem.inStockQuantity! > 9999 ? "9999+" : lineItem.inStockQuantity }}
                  {{ $t("common.suffixes.product_count_in_stock") }}</span
                >
              </div>
              <div v-else class="flex items-center">
                <span class="text-[color:var(--color-danger)] text-xs pt-1 whitespace-nowrap">{{
                  $t("common.messages.product_out_of_stock")
                }}</span>
              </div>
            </div>
          </div>

          <div v-if="!readOnly" class="lg:hidden flex flex-row space-x-2">
            <VcButton
              v-if="!isInputDisabled"
              size="sm"
              is-outline
              class="uppercase px-2 font-bold"
              @click="updateQuantity"
            >
              {{ $t("shared.checkout.product_card.update_button") }}
            </VcButton>

            <VcButton
              size="sm"
              kind="secondary"
              is-outline
              class="uppercase px-2"
              @click="$emit('remove:item', lineItem.id)"
            >
              {{ $t("shared.checkout.product_card.remove_button") }}
            </VcButton>
          </div>
          <div
            v-if="!readOnly"
            class="hidden lg:flex xl:w-1/4 flex-col space-y-1 text-xs font-semibold text-[color:var(--color-link)]"
          >
            <span
              v-if="!isInputDisabled"
              class="cursor-pointer"
              @click="updateQuantity"
              v-t="'shared.checkout.product_card.update_button'"
            ></span>
            <span
              class="cursor-pointer"
              @click="$emit('remove:item', lineItem.id)"
              v-t="'shared.checkout.product_card.remove_button'"
            ></span>
          </div>
          <div class="hidden lg:flex lg:w-28 lg:shrink-0 xl:w-2/4 lg:items-end flex-col text-sm font-extrabold pr-3">
            <span class="text-black self-end" v-t="'shared.checkout.product_card.total_label'"></span>
            <span class="text-green-700"><VcPriceDisplay :value="lineItem.extendedPrice" /></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcImage, VcPriceDisplay, VcButton } from "@/components";
import { LineItemType, ValidationErrorType } from "@/core/api/graphql/types";
import { computed, PropType } from "vue";
import { useField } from "vee-validate";
import * as yup from "yup";
import SeoUrl from "@core/seo-routes.enum";

// Define max qty available to add
const max = 999999;

const props = defineProps({
  lineItem: {
    type: Object as PropType<LineItemType>,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  validationError: {
    type: Object as PropType<ValidationErrorType>,
    default: undefined,
  },
});

const count = computed(() => props.lineItem.quantity);
const variation = computed(() => props.lineItem.product?.variations?.find((v) => v.id === props.lineItem.productId));
const minQty = computed(
  () => (variation.value ? variation.value?.minQuantity : props.lineItem.product?.minQuantity) || 0
);
const maxQty = computed(
  () => (variation.value ? variation.value?.maxQuantity : props.lineItem.product?.maxQuantity) || max
);

const productId = computed(() => props.lineItem.product?.masterVariation?.id || props.lineItem.productId);

let rules = yup.number().integer().optional().moreThan(0);
rules = rules.min(minQty.value);

if (props.lineItem.inStockQuantity) {
  rules = rules.max(Math.min(props.lineItem.inStockQuantity, maxQty.value, max));
}

const { value, validate, errorMessage } = useField("qty", rules, {
  initialValue: props.lineItem.inStockQuantity === 0 ? 0 : count,
});

const isInputDisabled = computed(() => props.lineItem.inStockQuantity === 0);

const updateQuantity = () => {
  if (!isInputDisabled.value) {
    emit("update:quantity", props.lineItem.id, value.value);
  }
};

validate();

const emit = defineEmits(["update:quantity", "remove:item"]);
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
