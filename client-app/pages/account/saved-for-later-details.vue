<template>
  <template v-if="saveForLaterLoading">
    <div class="contents md:flex md:flex-wrap md:items-center md:justify-between md:gap-3">
      <VcTypography tag="h1">
        {{ $t("pages.cart.saved_for_later") }}
      </VcTypography>
    </div>

    <div class="mt-5 w-full">
      <WishlistProductsSkeleton :itemsCount="6" />
    </div>
  </template>

  <ListDetails
    v-else-if="savedForLaterListId && !savedForLaterListIsEmpty"
    :list-id="savedForLaterListId"
    :list-name="$t('pages.cart.saved_for_later')"
    hide-settings
  />

  <div v-else>
    <VcTypography tag="h1">
      {{ $t("pages.cart.saved_for_later") }}
    </VcTypography>

    <VcEmptyView :text="$t('pages.cart.saved_for_later_not_found')" icon="list-v2" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useSavedForLater } from "@/shared/cart/composables/useSaveForLater";
import { WishlistProductsSkeleton } from "@/shared/wishlists";
import ListDetails from "./list-details.vue";

const { savedForLaterList, loading: saveForLaterLoading, getSavedForLater } = useSavedForLater();

const savedForLaterListId = computed(() => savedForLaterList.value?.id);
const savedForLaterListIsEmpty = computed(() => !savedForLaterList.value?.items?.length);

onMounted(() => {
  void getSavedForLater();
});
</script>
