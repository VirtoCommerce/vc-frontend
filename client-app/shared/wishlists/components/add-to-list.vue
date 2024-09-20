<template>
  <button
    :aria-label="tooltipText"
    :title="tooltipText"
    type="button"
    :class="[
      'flex items-center justify-center disabled:text-neutral-300',
      product.inWishlist ? 'text-primary' : 'text-neutral-400',
    ]"
    :disabled="!isAuthenticated"
    @click="openAddToListModal"
  >
    <VcIcon :class="customClass" name="whishlist" />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account/composables";
import { productsInWishlistEvent, TabsType, useBroadcast } from "@/shared/broadcast";
import { useModal } from "@/shared/modal";
import AddToWishlistsModal from "./add-to-wishlists-modal.vue";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  customClass?: string;
  tooltipPlacement?: VcTooltipPlacementType;
}

const props = withDefaults(defineProps<IProps>(), {
  customClass: "size-5 lg:size-4",
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
