<template>
  <div>
    <VcBreadcrumbs :items="breadcrumbs" class="mx-5 md:mx-0 lg:hidden" />

    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{ $t("shared.account.navigation.links.your_lists") }}
      </h2>

      <VcButton
        v-if="lists.length || loading"
        :is-disabled="creationButtonDisabled"
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
    <VcEmptyView v-else :text="$t('pages.account.your_lists.no_lists')">
      <template #icon>
        <VcImage src="/static/images/common/lists.svg" :alt="$t('pages.account.your_lists.lists_icon')" />
      </template>

      <template #button>
        <VcButton class="px-6 uppercase" size="lg" @click="openCreateListDialog">
          <i class="fa fa-plus text-inherit -ml-0.5 mr-2.5" />
          {{ $t("pages.account.your_lists.create_list_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import {
  WishlistCard,
  WishlistCardSkeleton,
  useWishlists,
  AddOrUpdateWishlistDialog,
  DeleteWishlistsDialog,
  UnsuccessfulCreateWishlistDialog,
} from "@/shared/wishlists";
import { LineItemType, WishlistType } from "@core/api/graphql/types";
import { useI18n } from "vue-i18n";
import { usePopup } from "@/shared/popup";
import { configInjectionKey } from "@/core/injection-keys";
import { inject } from "vue";
import { computed } from "@vue/reactivity";

const { t } = useI18n();
const { openPopup } = usePopup();
const { loading, lists, fetchWishlists } = useWishlists();

const breadcrumbs: IBreadcrumbs[] = [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("shared.account.navigation.links.your_lists"), route: { name: "Lists" } },
];

const config = inject(configInjectionKey);
const listsLimit = config?.wishlists_limit || 10;

const creationButtonDisabled = computed(() => lists.value.length >= listsLimit);

function addAllToCart(items: LineItemType[]) {
  // TODO: implement in another user story
  console.log(items);
}

function openCreateListDialog() {
  if (creationButtonDisabled.value) {
    openPopup({
      component: UnsuccessfulCreateWishlistDialog,
    });
  } else {
    openPopup({
      component: AddOrUpdateWishlistDialog,
    });
  }
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
