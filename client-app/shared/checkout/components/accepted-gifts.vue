<template>
  <VcWidget :title="$t('shared.checkout.accepted_gifts.title')" prepend-icon="gift" size="lg">
    <div class="divide-y rounded border">
      <div class="flex items-center px-6 py-2 text-sm font-bold">
        <div v-t="'shared.checkout.accepted_gifts.gift_label'" class="grow"></div>
        <div v-t="'shared.checkout.accepted_gifts.quantity_label'" class="ml-3 w-max"></div>
        <div class="hidden xl:block xl:w-[6.5rem]"></div>
      </div>

      <div v-for="gift in items" :key="gift.id" class="flex items-center px-6 py-3">
        <VcImage :src="gift.imageUrl" class="mr-4 h-[60px] w-[60px] shrink-0 rounded border" lazy />

        <span class="grow text-sm font-bold lg:text-13">
          {{ gift.name }}
        </span>

        <div class="ml-3 w-max">
          <input
            :disabled="true"
            class="h-8 w-[5.5rem] rounded border text-center text-sm disabled:bg-gray-100 disabled:text-gray-400"
            :value="gift.quantity"
          />
        </div>

        <div class="hidden xl:block xl:w-[6.5rem]"></div>
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import type { GiftItemType, OrderLineItemType } from "@/core/api/graphql/types";

interface IProps {
  items: (GiftItemType | OrderLineItemType)[];
}

defineProps<IProps>();
</script>
