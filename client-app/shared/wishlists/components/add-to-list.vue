<template>
  <VcTooltip :placement="tooltipPlacement" strategy="fixed">
    <template #trigger>
      <button type="button" class="block disabled:opacity-40" :disabled="!isAuthenticated" @click="openAddToListModal">
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
      <div class="rounded-sm bg-white py-1.5 px-3.5 text-xs text-tooltip shadow-sm-x-y">
        {{ $t("pages.catalog.wishlist_tooltip") }}
      </div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { useUser } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddToWishlistsModal } from "@/shared/wishlists";
import type { Product } from "@/xapi/types";
import type { PropType } from "vue";

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

function openAddToListModal() {
  if (!isAuthenticated.value) {
    return;
  }

  openPopup({
    component: AddToWishlistsModal,
    props: {
      product: props.product,
    },
  });
}
</script>
