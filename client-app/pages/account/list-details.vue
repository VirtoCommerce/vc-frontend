<template>
  <div class="bg-gray-100 grow pt-6 pb-16 shadow-inner" :class="{ 'polygon-gray-bg': !listItems?.length && !loading }">
    <div class="lg:hidden w-full max-w-screen-2xl mx-auto pb-5 px-5 md:px-12">
      <VcBreadcrumbs :items="breadcrumbs" />
    </div>
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <div class="flex lg:space-x-5">
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation list-details :active-list="list?.name" />
        </div>

        <!-- Second column-->
        <div class="flex flex-col w-full lg:w-4/5 space-y-5">
          <div class="flex justify-between items-center">
            <h2 class="text-gray-800 text-3xl font-bold uppercase">
              {{ list?.name }}
            </h2>

            <div class="flex space-x-3" v-if="!isMobile">
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
              ></WishlistProductItem>
              <div class="flex p-5" v-if="pages > 1">
                <VcPagination v-model:page="page" :pages="pages"></VcPagination>
              </div>
            </div>
            <div v-else class="grid grid-cols-2 gap-x-4 gap-y-6">
              <template v-for="item in listItems" :key="item.id">
                <div class="relative">
                  <div
                    class="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center absolute -top-3 -right-3 z-10 bg-white hover:bg-gray-100 cursor-pointer"
                    @click="openDeleteProductDialog(item)"
                  >
                    <i class="fas fa-times text-red-500"></i>
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
            <div v-else><ProductSkeletonGrid v-for="i in itemsPerPage" :key="i"></ProductSkeletonGrid></div>
          </template>

          <!-- Empty -->
          <VcEmptyView :text="$t('shared.wishlists.list_details.empty_list')" v-else>
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
          <div v-if="isMobile" class="flex flex-col space-y-4">
            <VcPagination v-if="pages > 1" v-model:page="page" :pages="pages" class="mb-3 lg:mb-0"></VcPagination>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcButton, VcBreadcrumbs, IBreadcrumbs, VcPagination, VcEmptyView, VcImage } from "@/components";
import { AccountNavigation } from "@/shared/account";
import { AddToCart } from "@/shared/cart";
import {
  WishlistProductItem,
  WishlistCardSkeleton,
  useWishlists,
  AddOrUpdateWishlistDialog,
  DeleteWishlistProductDialog,
} from "@/shared/wishlists";
import { LineItemType } from "@core/api/graphql/types";
import { ProductCardGrid, ProductSkeletonGrid } from "@/shared/catalog";
import { useI18n } from "vue-i18n";
import { usePopup } from "@/shared/popup";
import { computed, ref, watchEffect } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const { t } = useI18n();
const { openPopup } = usePopup();
const { loading, list, fetchWishList } = useWishlists();

const props = defineProps({
  listId: {
    type: String,
    default: "",
  },
});

const breadcrumbs: IBreadcrumbs[] = [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("shared.account.navigation.links.your_lists"), route: { name: "Lists" } },
  { title: t("shared.account.navigation.links.list_details") },
];

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
  const listId = props.listId;
  fetchWishList(listId);
});
</script>
