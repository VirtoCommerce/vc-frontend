<template>
  <VcSectionWidget v-if="items?.length" :title="$t('shared.checkout.accepted_gifts.title')" icon="gift">
    <div class="border rounded divide-y">
      <div class="flex items-center px-6 py-2 text-sm font-bold">
        <div v-t="'shared.checkout.accepted_gifts.gift_label'" class="grow"></div>
        <div v-t="'shared.checkout.accepted_gifts.quantity_label'" class="ml-3 w-max"></div>
        <div class="hidden xl:block xl:w-[6.5rem]"></div>
      </div>

      <div v-for="gift in items" :key="gift.id" class="flex items-center px-6 py-3">
        <VcImage :src="gift.imageUrl" class="shrink-0 mr-4 w-[60px] h-[60px] border rounded" lazy />

        <span class="grow text-sm font-bold lg:text-13">
          {{ gift.name }}
        </span>

        <div class="ml-3 w-max">
          <input
            :disabled="true"
            class="w-[5.5rem] h-8 border rounded text-center text-sm disabled:bg-gray-100 disabled:text-gray-400"
            :value="gift.quantity"
          />
        </div>

        <div class="hidden xl:block xl:w-[6.5rem]"></div>
      </div>
    </div>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { OrderLineItemType } from "@/xapi/types";
import { PropType } from "vue";

defineProps({
  items: {
    type: Array as PropType<OrderLineItemType[]>,
    default: undefined,
  },
});
</script>
