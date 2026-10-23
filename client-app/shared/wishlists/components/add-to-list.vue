<template>
  <VcMenuItem
    v-if="menuItem"
    color="secondary"
    :active="localWishlistStatus"
    :disabled="!isAuthenticated"
    :title="ariaLabel"
    nowrap
    data-test-id="add-to-list-menu-item"
    @click="onMenuItemClick"
  >
    <template #prepend>
      <VcIcon name="heart" />
    </template>

    <span>{{ menuItemLabel }}</span>
  </VcMenuItem>

  <VcProductActionsButton
    v-else
    data-test-id="add-to-list-button"
    color="danger"
    :icon-size="iconSize"
    :active="localWishlistStatus"
    :disabled="!isAuthenticated"
    :aria-label="ariaLabel"
    :aria-pressed="isAuthenticated ? localWishlistStatus : undefined"
    :tooltip-text="ariaLabel"
    @click="openAddToListModal"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account/composables";
import { dataChangedEvent, TabsType, useBroadcast } from "@/shared/broadcast";
import { useModal } from "@/shared/modal";
import AddToWishlistsModal from "./add-to-wishlists-modal.vue";
import type { Product } from "@/core/api/graphql/types";

interface IEmits {
  (event: "click"): void;
}

interface IProps {
  product: Product;
  iconSize?: VcIconSizeType;
  /** Renders the action as a `VcMenuItem` for a ⋮ menu. */
  menuItem?: boolean;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { t } = useI18n();
const { openModal } = useModal();
const { isAuthenticated } = useUser();
const broadcast = useBroadcast();

const localWishlistStatus = ref(false);

watch(
  () => props.product.inWishlist,
  (newValue) => {
    if (!props.product.isConfigurable) {
      localWishlistStatus.value = newValue;
    }
  },
  { immediate: true },
);

const menuItemLabel = computed<string>(() =>
  localWishlistStatus.value ? t("pages.catalog.in_the_list_tooltip") : t("pages.catalog.add_to_wishlist_tooltip"),
);

const ariaLabel = computed<string>(() =>
  isAuthenticated.value ? menuItemLabel.value : t("common.messages.wishlists_available_for_authorized"),
);

function onMenuItemClick(): void {
  emit("click");
  openAddToListModal();
}

function openAddToListModal() {
  if (!isAuthenticated.value) {
    return;
  }

  openModal({
    component: AddToWishlistsModal,
    props: {
      product: props.product,
      onResult: (inWishLists: boolean) => {
        localWishlistStatus.value = inWishLists;

        void broadcast.emit(dataChangedEvent, TabsType.ALL);
      },
    },
  });
}
</script>
