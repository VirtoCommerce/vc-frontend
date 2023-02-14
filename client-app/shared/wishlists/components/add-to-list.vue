<template>
  <VcTooltip :placement="tooltipPlacement" strategy="fixed">
    <template #trigger>
      <button class="block disabled:opacity-40" :disabled="!isAuthenticated" @click="openAddToListModal">
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
      <div class="bg-white rounded-sm text-xs text-tooltip shadow-sm-x-y py-1.5 px-3.5">
        <span v-if="isProductInList">
          {{ $t("pages.catalog.product_is_in_list") }}
        </span>
        <span v-else>
          {{ $t("pages.catalog.add_product_to_list") }}
        </span>
      </div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { some } from "lodash";
import { Product } from "@/xapi/types";
import { usePopup } from "@/shared/popup";
import { useUser } from "@/shared/account";
import { AddToWishlistsModal, useWishlists } from "@/shared/wishlists";

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
const { lists } = useWishlists();

const isProductInList = computed(() =>
  some(lists.value, (list) => list.items?.some((item) => item.productId === props.product.id))
);

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
