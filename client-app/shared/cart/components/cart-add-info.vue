<template>
  <VcPopup :variant="variant" :title="title">
    <template #actions="{ close }">
      <VcButton
        is-outline
        class="lg:px-4 uppercase flex-grow lg:flex-grow-0 inline-flex"
        @click="close"
        v-t="'shared.cart.cart_add_info_popup.continue_shopping_button'"
      >
      </VcButton>
      <VcButton
        to="/checkout"
        class="uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-4"
        @click="close"
        v-t="'shared.cart.cart_add_info_popup.view_cart_button'"
      >
      </VcButton>
    </template>

    <div class="hidden lg:block">
      <table class="w-full">
        <thead class="border-b border-gray-200">
          <tr>
            <th class="px-5 py-3 text-sm font-bold" v-t="'shared.cart.cart_add_info_popup.table.product_column'"></th>
            <th
              class="px-5 py-3 text-sm font-bold text-center"
              v-t="'shared.cart.cart_add_info_popup.table.quantity_column'"
            ></th>
            <th
              class="px-5 py-3 text-sm font-bold text-right"
              v-t="'shared.cart.cart_add_info_popup.table.total_column'"
            ></th>
          </tr>
        </thead>
        <tbody class="border-b border-gray-200">
          <tr>
            <td class="px-5 py-3">
              <div class="flex items-center">
                <VcImage class="border object-contain rounded-sm" :src="lineItem.imageUrl" width="72" height="72" />
                <div class="ml-4 font-bold text-blue-700">{{ lineItem.name }}</div>
              </div>
            </td>
            <td class="px-5 py-3 text-center">{{ lineItem.quantity }}</td>
            <td class="px-5 py-3 text-right text-green-700 font-bold">
              <VcPriceDisplay :value="lineItem.extendedPrice" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="block lg:hidden">
      <div class="flex items-center border-b border-gray-200 p-5">
        <VcImage class="border object-contain rounded-sm" :src="lineItem.imageUrl" width="72" height="72" />
        <div class="ml-4 font-bold text-blue-700">{{ lineItem.name }}</div>
      </div>

      <div class="flex items-center justify-between px-5 py-3">
        <div>
          {{ $t("shared.cart.cart_add_info_popup.quantity_label") }}
          <span class="font-bold">{{ lineItem.quantity }}</span>
        </div>
        <div>
          {{ $t("shared.cart.cart_add_info_popup.total_label") }}
          <span class="font-bold text-green-700">
            <VcPriceDisplay :value="lineItem.extendedPrice" />
          </span>
        </div>
      </div>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { LineItemType } from "@/core/api/graphql/types";
import { VcPopup, VcImage, VcPriceDisplay, VcButton } from "@/components";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },

  lineItem: {
    type: Object as PropType<LineItemType>,
    required: true,
  },
});

const variant = computed(() => (props.lineItem.quantity === 0 ? "warn" : "success"));
const title = computed(() =>
  props.lineItem.quantity === 0
    ? t("shared.cart.cart_add_info_popup.title_removed")
    : t("shared.cart.cart_add_info_popup.title_added")
);
</script>
