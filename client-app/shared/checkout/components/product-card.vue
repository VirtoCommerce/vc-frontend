<template>
  <div class="border-b">
    <div class="p-5 flex flex-wrap overflow-hidden gap-x-4 lg:gap-6">
      <div class="border border-gray-100 w-16 h-16">
        <img
          :src="lineItem.imageUrl || '/assets/static/images/common/no-image.svg'"
          :alt="lineItem.product?.name"
          class="w-full h-full object-cover object-center"
        />
      </div>

      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center flex-1">
        <div class="mb-3 lg:mb-0 text-sm lg:w-1/2">
          <router-link
            :to="`/catalog/${lineItem.product?.slug}`"
            class="text-cyan-700 font-extrabold line-clamp-3 overflow-hidden"
          >
            {{ lineItem.name }}
          </router-link>
          <div class="flex">
            <span class="font-medium text-gray-500 pr-1">Brand: </span>
            <span class="mx-2 border-b-2 flex-1 border-gray-100 border-dotted lg:hidden"></span>
            <span class="w-1/3 lg:w-auto font-bold">{{ lineItem.product?.brandName }}</span>
          </div>
          <div class="flex text-sm">
            <span class="font-medium text-gray-500 pr-1">Price: </span>
            <span class="mx-2 border-b-2 flex-1 border-gray-100 border-dotted lg:hidden"></span>
            <p class="w-1/3 lg:w-auto font-bold">
              <span class="text-green-700">{{ lineItem.listPrice?.formattedAmount }}</span> <span class="hidden lg:inline">/ each</span>
            </p>
          </div>
          <div class="flex text-sm lg:hidden">
            <span class="font-medium text-gray-500">Total: </span>
            <span class="mx-2 border-b-2 flex-1 border-gray-100 border-dotted lg:hidden"></span>
            <span class="w-1/3 text-green-700 font-bold">{{ lineItem.extendedPrice?.formattedAmount }}</span>
          </div>
        </div>

        <div class="flex items-start gap-2 lg:gap-6">
          <div class="flex flex-col items-center">
            <input
              v-model="value"
              type="number"
              class="w-20 lg:w-14 border rounded overflow-hidden h-8 lg:h-10 focus:ring ring-inset outline-none p-1 text-center"
              :class="{ 'text-red-500': isInputdisabled, 'border-red-500': errorMessage }"
              :disabled="isInputdisabled"
            />
            <div v-if="!isInputdisabled" class="flex items-center">
              <span class="text-green-700 text-xs pt-1 whitespace-nowrap">{{ lineItem.inStockQuantity }} in stock</span>
            </div>
            <div v-else class="flex items-center">
              <span class="text-red-500 text-xs pt-1 whitespace-nowrap">Out of stock</span>
            </div>
          </div>

          <button
            v-if="!isInputdisabled"
            class="lg:hidden rounded uppercase h-8 px-2 border-2 font-roboto-condensed font-bold text-sm text-yellow-500 border-yellow-500 hover:text-white hover:bg-yellow-500"
            @click="updateQuantity"
          >
            Update
          </button>
          <button
            class="lg:hidden rounded uppercase h-8 px-2 border-2 font-roboto-condensed font-bold text-sm text-black border-black hover:text-white hover:bg-black"
            @click="$emit('remove:item', lineItem.id)"
          >
            Remove
          </button>
          <div class="hidden lg:flex flex-col gap-1 text-xs font-semibold text-cyan-700">
            <span v-if="!isInputdisabled" class="cursor-pointer" @click="updateQuantity">Update</span>
            <span class="cursor-pointer" @click="$emit('remove:item', lineItem.id)">Remove</span>
          </div>
          <div class="hidden lg:flex flex-col text-sm font-extrabold pr-3">
            <span class="text-black self-end">Total</span>
            <span class="text-green-700">{{ lineItem.extendedPrice?.formattedAmount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LineItemType } from "@/core/api/graphql/types";
import { computed, PropType } from "vue";
import { useField } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  lineItem: {
    type: Object as PropType<LineItemType>,
    required: true,
  },
});

const count = computed(() => props.lineItem.quantity);

let rules = yup
  .number()
  .integer()
  .optional()
  .min(0)
  .transform((_, val) => (isNaN(val) ? (count.value ? 0 : null) : +val));

if (props.lineItem.inStockQuantity) {
  rules = rules.max(props.lineItem.inStockQuantity);
}

const { value, validate, errorMessage } = useField("qty", rules, {
  initialValue: props.lineItem.inStockQuantity === 0 ? 0 : count,
});

const isInputdisabled = computed(() => props.lineItem.inStockQuantity === 0);

const updateQuantity = () => {
  if (!isInputdisabled.value) {
    emit("update:quantity", props.lineItem.id, value.value);
  }
};

validate();

const emit = defineEmits(["update:quantity", "remove:item"]);
defineExpose({ updateQuantity });
</script>

<style scoped></style>
