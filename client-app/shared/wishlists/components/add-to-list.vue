<template>
  <VcProductActionsButton
    color="danger"
    :icon-size="iconSize"
    :active="inWishList"
    :disabled="!isAuthenticated"
    :tooltip-text="tooltipText"
    @click="openAddToListModal"
  />
</template>

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account/composables";
import { dataChangedEvent, TabsType, useBroadcast } from "@/shared/broadcast";
import { useModal } from "@/shared/modal";
import AddToWishlistsModal from "./add-to-wishlists-modal.vue";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  iconSize?: VcIconSizeType;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { openModal } = useModal();
const { isAuthenticated } = useUser();
const broadcast = useBroadcast();

const inWishList = ref(toRef(props, "product").value.inWishlist);

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
      onResult: (inWishLists: boolean) => {
        inWishList.value = inWishLists;

        void broadcast.emit(dataChangedEvent, TabsType.ALL);
      },
    },
  });
}
</script>
