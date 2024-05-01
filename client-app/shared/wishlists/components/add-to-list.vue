<template>
  <VcTooltip :placement="tooltipPlacement" strategy="fixed">
    <template #trigger>
      <slot :open-modal="openAddToListModal" :is-authenticated="isAuthenticated" :is-in-wishlist="product.inWishlist">
        <button type="button" class="flex" :disabled="!isAuthenticated" @click="openAddToListModal">
          <VcIcon
            :class="[customClass, product.inWishlist ? 'text-[--color-primary-500]' : 'text-[--color-neutral-400]']"
            name="whishlist"
          />
        </button>
      </slot>
    </template>

    <template #content>
      <div
        class="max-w-[8rem] rounded-sm bg-additional-50 px-3.5 py-1.5 text-xs text-neutral-800 shadow-sm-x-y xs:max-w-[10rem]"
      >
        {{ tooltipText }}
      </div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account";
import { productsInWishlistEvent, TabsType, useBroadcast } from "@/shared/broadcast";
import { useModal } from "@/shared/modal";
import AddToWishlistsModal from "./add-to-wishlists-modal.vue";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  customClass?: string;
  tooltipPlacement?: VcTooltipPlacement;
}

const props = withDefaults(defineProps<IProps>(), {
  customClass: "w-5 h-5 lg:w-4 lg:h-4",
  tooltipPlacement: "left",
});

const { t } = useI18n();
const { openModal } = useModal();
const { isAuthenticated } = useUser();
const broadcast = useBroadcast();

const tooltipText = computed<string>(() => {
  if (!isAuthenticated.value) {
    return t("common.messages.wishlists_available_for_authorized");
  } else if (props.product.inWishlist) {
    return t("pages.catalog.in_the_list_tooltip");
  } else {
    return t("pages.catalog.add_to_wishlist_tooltip");
  }
});

function openAddToListModal() {
  if (!isAuthenticated.value) {
    return;
  }

  openModal({
    component: AddToWishlistsModal,
    props: {
      product: props.product,
      onResult: (isInLists: boolean) => {
        broadcast.emit(
          productsInWishlistEvent,
          [
            {
              productId: props.product.id,
              inWishlist: isInLists,
            },
          ],
          TabsType.ALL,
        );
      },
    },
  });
}
</script>
