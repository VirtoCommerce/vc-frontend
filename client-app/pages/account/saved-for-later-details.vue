<template>
  <VcLoaderOverlay :visible="saveForLaterLoading" fixed-spinner />

  <ListDetails v-if="savedForLaterListId" :list-id="savedForLaterListId" hide-settings />

  <div v-else-if="!saveForLaterLoading">
    <VcTypography tag="h1">
      {{ $t("pages.cart.saved_for_later") }}
    </VcTypography>

    <VcEmptyView :text="$t('pages.cart.saved_for_later_not_found')" icon="list-v2" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useSavedForLater } from "@/shared/cart/composables/useSaveForLater";
import ListDetails from "./list-details.vue";

const savedForLaterListId = computed(() => savedForLaterList.value?.id);

const { savedForLaterList, loading: saveForLaterLoading, getSavedForLater } = useSavedForLater();

onMounted(() => {
  void getSavedForLater();
});
</script>
