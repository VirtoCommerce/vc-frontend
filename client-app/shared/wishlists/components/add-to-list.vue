<template>
  <VcTooltip :placement="tooltipPlacement" strategy="fixed">
    <template #trigger>
      <button class="block disabled:opacity-40" :disabled="!isAuthenticated" @click="addToList">
        <svg
          :class="[
            customClass,
            true ? 'text-[color:var(--color-product-icon)]' : 'text-[color:var(--color-product-icon-active)]',
          ]"
        >
          <use href="/static/images/star.svg#main"></use>
        </svg>
      </button>
    </template>

    <template #content>
      <div class="bg-white rounded-sm text-xs text-tooltip shadow-sm-x-y py-1.5 px-3.5">
        {{ $t("pages.catalog.wishlist_tooltip") }}
      </div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Product } from "@/xapi/types";
import { usePopup } from "@/shared/popup";
import { useUser } from "@/shared/account";
import { AddToWishlistsDialog } from "@/shared/wishlists";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
  customClass: {
    type: String,
    default: "w-6 h-6 lg:w-4 lg:h-4",
  },
  tooltipPlacement: {
    type: String,
    default: "left",
  },
});

const { openPopup } = usePopup();
const { isAuthenticated } = useUser();

function addToList() {
  if (!isAuthenticated.value) {
    return;
  }

  openPopup({
    component: AddToWishlistsDialog,
    props: {
      product: props.product,
    },
  });
}
</script>
