<template>
  <VcSection
    v-if="items?.length"
    :title="$t('shared.checkout.accepted_gifts.title')"
    icon-url="/static/images/checkout/gifts.svg"
    class="shadow-inner pb-8 lg:shadow"
  >
    <div class="xl:ml-28 lg:ml-6 xl:mr-11 lg:mr-6 lg:border lg:rounded">
      <div class="hidden lg:flex border-b font-bold items-center justify-between px-6 py-2">
        <div class="flex-grow" v-t="'shared.checkout.accepted_gifts.gift_label'"></div>
        <div class="lg:w-1/4" v-t="'shared.checkout.accepted_gifts.quantity_label'"></div>
      </div>
      <div
        v-for="gift in items"
        :key="gift.id"
        class="border-b last:border-b-0 flex items-center justify-between px-6 py-6"
      >
        <div class="flex-grow flex items-center">
          <VcImage :src="gift.imageUrl" class="mr-4 border aspect-square w-16 h-16" />
          <div>
            <div class="flex-grow font-bold text-[color:var(--color-link)]">{{ gift.name }}</div>
            <div class="lg:hidden">
              <span class="font-bold">{{ $t("shared.checkout.accepted_gifts.quantity_label") }}:</span>
              {{ gift.quantity }}
            </div>
          </div>
        </div>
        <div class="hidden lg:block lg:w-1/4">{{ gift.quantity }}</div>
      </div>
    </div>
  </VcSection>
</template>

<script setup lang="ts">
import { VcSection, VcImage } from "@/components";
import { OrderLineItemType } from "@/core/api/graphql/types";
import { PropType } from "vue";

defineProps({
  items: {
    type: Array as PropType<OrderLineItemType[]>,
    default: undefined,
  },
});
</script>
