<template>
  <div class="bg-gray-100 grow pt-6 pb-16 shadow-inner" :class="{ 'polygon-gray-bg': !lists.length && !loading }">
    <div class="lg:hidden w-full max-w-screen-2xl mx-auto pb-5 px-5 md:px-12">
      <VcBreadcrumbs :items="breadcrumbs" />
    </div>

    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <div class="flex lg:space-x-5">
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation />
        </div>

        <!-- Second column-->
        <div class="flex flex-col w-full lg:w-4/5 space-y-5">
          <div class="flex justify-between items-center mx-5 md:mx-0">
            <h2 class="text-gray-800 text-3xl font-bold uppercase">
              {{ $t("shared.account.navigation.links.your_lists") }}
            </h2>

            <VcButton
              v-if="lists.length || loading"
              class="px-3 uppercase"
              size="sm"
              is-outline
              @click="openCreateListDialog"
            >
              <i class="fa fa-plus text-inherit -ml-0.5 mr-2" />

              <span class="hidden sm:inline">{{ $t("pages.account.your_lists.create_list_button") }}</span>
              <span class="sm:hidden">{{ $t("pages.account.your_lists.create_list_button_mobile") }}</span>
            </VcButton>
          </div>

          <!-- Lists -->
          <div v-if="lists.length" class="flex flex-col md:space-y-3 divide-y md:divide-none">
            <WishlistCard
              v-for="list in lists"
              :key="list.id"
              :list="list"
              @add-to-cart="addAllToCart(list.items!)"
              @settings="openListSettingsDialog(list)"
              @remove="openDeleteListDialog(list)"
            />
          </div>

          <!-- Skeletons -->
          <div v-else-if="loading" class="flex flex-col md:space-y-3 divide-y md:divide-none">
            <WishlistCardSkeleton v-for="item in 5" :key="item" />
          </div>

          <!-- Empty -->
          <div v-else class="flex grow items-center justify-center">
            <div class="text-center my-20 lg:my-0 p-6">
              <p class="font-bold mb-7 text-xl md:text-2xl">
                {{ $t("pages.account.your_lists.no_lists") }}
              </p>

              <VcButton class="px-6 uppercase" size="lg" @click="openCreateListDialog">
                <i class="fa fa-plus text-inherit -ml-0.5 mr-2.5" />
                {{ $t("pages.account.your_lists.create_list_button") }}
              </VcButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcButton, VcBreadcrumbs, IBreadcrumbs } from "@/components";
import { AccountNavigation } from "@/shared/account";
import {
  WishlistCard,
  WishlistCardSkeleton,
  useWishlists,
  AddOrUpdateWishlistDialog,
  DeleteWishlistsDialog,
} from "@/shared/wishlists";
import { LineItemType, WishlistType } from "@core/api/graphql/types";
import { useI18n } from "vue-i18n";
import { usePopup } from "@/shared/popup";

const { t } = useI18n();
const { openPopup } = usePopup();
const { loading, lists, fetchWishlists } = useWishlists();

const breadcrumbs: IBreadcrumbs[] = [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("shared.account.navigation.links.your_lists"), route: { name: "Lists" } },
];

function addAllToCart(items: LineItemType[]) {
  // TODO: implement in another user story
  console.log(items);
}

function openCreateListDialog() {
  openPopup({
    component: AddOrUpdateWishlistDialog,
  });
}

function openListSettingsDialog(list: WishlistType) {
  openPopup({
    component: AddOrUpdateWishlistDialog,
    props: {
      list,
    },
  });
}

function openDeleteListDialog(list: WishlistType) {
  openPopup({
    component: DeleteWishlistsDialog,
    props: {
      list,
    },
  });
}

fetchWishlists();
</script>
