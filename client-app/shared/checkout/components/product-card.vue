<template>
  <div class="border-b">
    <div class="p-5 pb-10 flex flex-wrap overflow-hidden gap-x-4 sm:gap-y-4 lg:gap-6">
      <div class="border border-gray-100 w-16 h-16">
        <img
          :src="lineItem.imageUrl || '/assets/static/images/no-image.svg'"
          :alt="lineItem.product?.name"
          class="w-full h-full object-cover object-center"
        />
      </div>

      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center flex-1">
        <div class="mb-3 text-sm">
          <router-link :to="`/`" class="text-cyan-700 font-extrabold line-clamp-3 overflow-hidden">
            {{ lineItem.name }}
          </router-link>
          <div class="flex">
            <span class="font-medium text-gray-500">Brand: </span>
            <span class="dots lg:hidden"></span>
            <span class="w-1/3 lg:w-auto font-bold">{{ lineItem.product?.brandName }}</span>
          </div>
          <div class="flex text-sm">
            <span class="font-medium text-gray-500">Price: </span>
            <span class="dots lg:hidden"></span>
            <p class="w-1/3 lg:w-auto font-bold">
              {{ lineItem.listPrice?.formattedAmount }} <span class="hidden lg:inline">/ each</span>
            </p>
          </div>
          <div class="flex text-sm lg:hidden">
            <span class="font-medium text-gray-500">Total: </span>
            <span class="dots"></span>
            <span class="w-1/3 text-green-700 font-bold">{{ lineItem.extendedPrice?.formattedAmount }}</span>
          </div>
        </div>

        <div class="flex items-start gap-2 lg:gap-6">
          <div class="flex flex-col items-center">
            <input
              :value="disabled ? 0 : lineItem.quantity"
              type="text"
              class="w-20 lg:w-14 border rounded overflow-hidden h-8 lg:h-10 focus:ring ring-inset outline-none px-4 py-2 text-center"
              :class="{ 'text-red-500': disabled }"
              :disabled="disabled"
            />
            <div v-if="!disabled" class="flex items-center">
              <span class="text-green-700 text-xs pt-1 whitespace-nowrap">{{ lineItem.inStockQuantity }} in stock</span>
            </div>
            <div v-else class="flex items-center">
              <span class="text-red-500 text-xs pt-1 whitespace-nowrap">Out of stock</span>
            </div>
          </div>

          <button
            v-if="!disabled"
            class="lg:hidden rounded uppercase h-8 px-2 border-2 font-roboto-condensed font-bold text-sm text-yellow-500 border-yellow-500"
            @click="$emit('update:quantity', lineItem.id, 0)"
          >
            Update
          </button>
          <button
            class="lg:hidden rounded uppercase h-8 px-2 border-2 font-roboto-condensed font-bold text-sm text-black border-black"
            @click="$emit('remove:item', lineItem.id)"
          >
            Remove
          </button>
          <div class="hidden lg:flex flex-col gap-1 text-xs font-semibold text-cyan-700">
            <span v-if="!disabled" class="cursor-pointer" @click="$emit('update:quantity', lineItem.id, 0)"
              >Update</span
            >
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

const props = defineProps({
  lineItem: {
    type: Object as PropType<LineItemType>,
    required: true,
  },
});

const disabled = computed(() => props.lineItem.quantity > props.lineItem.inStockQuantity);

defineEmits(["update:quantity", "remove:item"]);
</script>

<style scoped></style>
