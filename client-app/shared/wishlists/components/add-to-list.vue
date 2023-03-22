<template>
  <VcTooltip :placement="tooltipPlacement" strategy="fixed">
    <template #trigger>
      <button type="button" class="block disabled:opacity-40" :disabled="!isAuthenticated" @click="openAddToListModal">
        <svg
          :class="[
            customClass,
            isProductInList
              ? 'text-[color:var(--color-product-icon-active)]'
              : 'text-[color:var(--color-product-icon)]',
          ]"
        >
          <use href="/static/images/star.svg#main"></use>
        </svg>
      </button>
    </template>

    <template #content>
      <div class="rounded-sm bg-white py-1.5 px-3.5 text-xs text-tooltip shadow-sm-x-y">
        <span v-if="isProductInList">
          {{ $t("pages.catalog.in_the_list_tooltip") }}
        </span>
        <span v-else>
          {{ $t("pages.catalog.add_to_wishlist_tooltip") }}
        </span>
      </div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUser } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import AddToWishlistsModal from "./add-to-wishlists-modal.vue";
import type { Product } from "@/xapi/types";

interface IProps {
  product: Product;
  customClass?: string;
  tooltipPlacement?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  customClass: "w-6 h-6 lg:w-4 lg:h-4",
  tooltipPlacement: "left",
});

const { openPopup } = usePopup();
const { isAuthenticated } = useUser();

const isProductInList = ref(props.product.inWishlist);

function openAddToListModal() {
  if (!isAuthenticated.value) {
    return;
  }

  openPopup({
    component: AddToWishlistsModal,
    props: {
      product: props.product,

      onResult: (isInList: boolean) => (isProductInList.value = isInList),
    },
  });
}
</script>
