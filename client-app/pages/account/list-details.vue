<template>
  <div>
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between md:mx-0">
      <h2 class="truncate text-3xl font-bold uppercase text-gray-800">
        {{ list?.name }}
      </h2>

      <div v-if="!isMobile" class="flex gap-x-3">
        <VcButton class="w-36 px-3 uppercase" size="sm" is-outline @click="openListSettingsModal">
          <i class="fas fa-cog -ml-0.5 mr-2 text-inherit" />
          {{ $t("shared.wishlists.list_card.list_settings_button") }}
        </VcButton>

        <!--
        <VcButton
          v-if="listItems.length"
          class="px-3 uppercase w-56"
          size="sm"
          :is-disabled="!listItems.length"
          @click="addAllToCart"
        >
          <i class="fa fa-shopping-cart text-inherit text-xs mr-2" />
          {{ $t("shared.wishlists.list_details.add_all_to_cart_button") }}
        </VcButton>
        -->
      </div>
    </div>

    <!-- Skeletons -->
    <template v-if="loading">
      <div v-if="isMobile" class="mx-5 grid grid-cols-2 gap-x-4 gap-y-6 md:mx-0">
        <ProductSkeletonGrid v-for="i in listItems.length || itemsPerPage" :key="i" />
      </div>

      <div v-else class="flex flex-col rounded border bg-white shadow-sm">
        <WishlistProductItemSkeleton v-for="i in listItems.length || itemsPerPage" :key="i" class="even:bg-gray-50" />
      </div>
    </template>

    <!-- List details -->
    <template v-else-if="listItems.length">
      <div class="flex flex-col gap-6 bg-white p-5 md:rounded md:border md:shadow-t-3sm">
        <WishlistLineItems :items="listItems" @remove:item="openDeleteProductModal" />

        <VcPagination
          v-if="pages > 1"
          v-model:page="page"
          :pages="pages"
          class="self-start"
          @update:page="onUpdatePage()"
        />
      </div>
    </template>

    <!-- Empty -->
    <VcEmptyView v-else :text="$t('shared.wishlists.list_details.empty_list')">
      <template #icon>
        <VcImage :alt="$t('shared.wishlists.list_details.list_icon')" src="/static/images/common/list.svg" />
      </template>

      <template #button>
        <VcButton :to="{ name: 'Catalog' }" size="lg" class="w-48 font-bold uppercase">
          {{ $t("shared.wishlists.list_details.empty_list_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useGoogleAnalytics, usePageHead } from "@/core/composables";
import { ProductSkeletonGrid } from "@/shared/catalog";
import { BackButtonInHeader } from "@/shared/layout";
import { usePopup } from "@/shared/popup";
import {
  WishlistProductItemSkeleton,
  WishlistLineItems,
  useWishlists,
  AddOrUpdateWishlistModal,
  DeleteWishlistProductModal,
} from "@/shared/wishlists";
import { LineItemType } from "@/xapi/types";

const props = defineProps({
  listId: {
    type: String,
    default: "",
  },
});

const { t } = useI18n();
const { openPopup } = usePopup();
const { loading, list, fetchWishList, clearList } = useWishlists();
const ga = useGoogleAnalytics();

usePageHead({
  title: computed(() => t("pages.account.list_details.meta.title", [list.value?.name])),
});

const itemsPerPage = ref(6);
const page = ref(1);

const pages = computed<number>(() => Math.ceil((list.value?.items?.length ?? 0) / itemsPerPage.value));
const listItems = computed<LineItemType[]>(() =>
  (list.value?.items || []).slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

/*
function addAllToCart() {
  // TODO: implement in another user story
}
*/

function openDeleteProductModal(item: LineItemType) {
  openPopup({
    component: DeleteWishlistProductModal,
    props: {
      listItem: item,
      listId: list.value?.id,
      async onResult() {
        const previousPagesCount = pages.value;

        await fetchWishList(props.listId);

        /**
         * If you were on the last page, and after deleting the product
         * the number of pages has decreased, go to the previous page
         */
        if (previousPagesCount > 1 && previousPagesCount === page.value && previousPagesCount > pages.value) {
          page.value -= 1;
        }
      },
    },
  });
}

function openListSettingsModal() {
  openPopup({
    component: AddOrUpdateWishlistModal,
    props: {
      list: list.value,
    },
  });
}

/**
 * Scroll after page change.
 */
function onUpdatePage() {
  window.scroll({ top: 0, behavior: "smooth" });
}

watchEffect(() => {
  clearList();
  fetchWishList(props.listId);
});

/**
 * Send Google Analytics event for related products.
 */
watchEffect(() => {
  const items = list.value?.items
    ?.map((item) => item.product!)
    // filtering of deleted products
    .filter(Boolean);

  if (items?.length) {
    ga.viewItemList(items, {
      item_list_name: `Wishlist "${list.value?.name}"`,
    });
  }
});
</script>
