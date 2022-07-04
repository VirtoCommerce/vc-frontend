<template>
  <div>
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase truncate">
        {{ list?.name }}
      </h2>

      <div v-if="!isMobile" class="flex gap-x-3">
        <VcButton class="px-3 uppercase w-36" size="sm" is-outline @click="openListSettingsDialog">
          <i class="fas fa-cog text-inherit -ml-0.5 mr-2" />
          {{ $t("shared.wishlists.list_card.list_settings_button") }}
        </VcButton>

        <VcButton
          v-if="listItems?.length"
          class="px-3 uppercase w-56"
          size="sm"
          :is-disabled="!listItems.length"
          @click="$emit('add-to-cart')"
        >
          <i class="fa fa-shopping-cart text-inherit text-xs mr-2" />
          {{ $t("shared.wishlists.list_details.add_all_to_cart_button") }}
        </VcButton>
      </div>
    </div>

    <!-- List details -->
    <template v-if="listItems?.length">
      <div v-if="!isMobile" class="flex flex-col bg-white rounded border shadow-sm">
        <WishlistProductItem
          v-for="item in listItems"
          :key="item.id"
          :product="item.product!"
          class="even:bg-gray-50"
          @remove="openDeleteProductDialog(item)"
        />

        <div class="flex p-5" v-if="pages > 1">
          <VcPagination v-model:page="page" :pages="pages" />
        </div>
      </div>

      <div v-else class="grid grid-cols-2 gap-x-4 gap-y-6 mx-5 md:mx-0">
        <template v-for="item in listItems" :key="item.id">
          <div class="relative">
            <div
              class="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center absolute -top-3 -right-3 z-10 bg-white hover:bg-gray-100 cursor-pointer"
              @click="openDeleteProductDialog(item)"
            >
              <i class="fas fa-times text-red-500" />
            </div>

            <ProductCardGrid :product="item.product!" class="h-full">
              <template #cart-handler>
                <AddToCart :product="item.product!" />
              </template>
            </ProductCardGrid>
          </div>
        </template>
      </div>
    </template>

    <!-- Skeletons -->
    <template v-else-if="loading">
      <div v-if="!isMobile" class="flex flex-col md:space-y-3 divide-y md:divide-none">
        <WishlistCardSkeleton v-for="i in itemsPerPage" :key="i" />
      </div>

      <div v-else class="grid grid-cols-2 gap-x-4 gap-y-6 mx-5 md:mx-0">
        <ProductSkeletonGrid v-for="i in itemsPerPage" :key="i" />
      </div>
    </template>

    <!-- Empty -->
    <VcEmptyView v-else :text="$t('shared.wishlists.list_details.empty_list')">
      <template #icon>
        <VcImage src="/static/images/common/list.svg" :alt="$t('shared.wishlists.list_details.list_icon')" />
      </template>

      <template #button>
        <VcButton :to="{ name: 'Catalog' }" size="lg" class="w-48 uppercase font-bold">
          {{ $t("shared.wishlists.list_details.empty_list_button") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <!-- Mobile footer block -->
    <div v-if="isMobile" class="flex flex-col space-y-4 mx-5 md:mx-0">
      <VcPagination v-if="pages > 1" v-model:page="page" :pages="pages" class="mb-3 lg:mb-0" />

      <VcButton
        v-if="listItems?.length"
        class="px-3 uppercase w-full"
        size="md"
        :is-disabled="!listItems.length"
        @click="addAllToCart"
      >
        <i class="fa fa-shopping-cart text-inherit text-xs mr-2" />
        {{ $t("shared.wishlists.list_details.add_all_to_cart_button") }}
      </VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AddToCart } from "@/shared/cart";
import {
  WishlistProductItem,
  WishlistCardSkeleton,
  useWishlists,
  AddOrUpdateWishlistDialog,
  DeleteWishlistProductDialog,
} from "@/shared/wishlists";
import { LineItemType } from "@/xapi/types";
import { ProductCardGrid, ProductSkeletonGrid } from "@/shared/catalog";
import { usePopup } from "@/shared/popup";
import { computed, ref, watchEffect } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { BackButtonInHeader } from "@/shared/layout";
import { usePageHead } from "@/core/composables";
import { useI18n } from "vue-i18n";

const props = defineProps({
  listId: {
    type: String,
    default: "",
  },
});

const { t } = useI18n();
const { openPopup } = usePopup();
const { loading, list, fetchWishList, clearList } = useWishlists();

usePageHead({
  title: computed(() => t("pages.account.list_details.meta.title", [list.value?.name])),
});

const itemsPerPage = ref(6);
const page = ref(1);
const pages = computed(() => Math.ceil((list.value?.itemsCount ?? 0) / itemsPerPage.value));

const listItems = computed(() =>
  list.value?.items?.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

function addAllToCart(items: LineItemType[]) {
  // TODO: implement in another user story
  console.log(items);
}

function openDeleteProductDialog(item: LineItemType) {
  openPopup({
    component: DeleteWishlistProductDialog,
    props: {
      listItem: item,
      listId: list.value?.id,
      onResult() {
        if (pages.value === 1) {
          page.value = 1;
        }
      },
    },
  });
}

function openListSettingsDialog() {
  openPopup({
    component: AddOrUpdateWishlistDialog,
    props: {
      list: list.value,
    },
  });
}

watchEffect(() => {
  clearList();
  fetchWishList(props.listId);
});
</script>
