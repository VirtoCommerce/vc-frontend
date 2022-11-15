<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{ $t("shared.account.navigation.links.lists") }}
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

        <span class="hidden sm:inline">{{ $t("pages.account.lists.create_list_button") }}</span>
        <span class="sm:hidden">{{ $t("pages.account.lists.create_list_button_mobile") }}</span>
      </VcButton>
    </div>

    <!-- Skeletons -->
    <div v-if="loading" class="flex flex-col md:space-y-3 divide-y md:divide-none">
      <WishlistCardSkeleton v-for="item in 5" :key="item" />
    </div>

    <!-- Lists -->
    <div v-else-if="lists.length" class="flex flex-col md:gap-y-3 overflow-x-hidden md:overflow-x-visible">
      <template v-if="isMobile">
        <VcSlidingActions
          v-for="list in lists"
          :key="list.id"
          :input-object="list"
          :actions-builder="itemActionsBuilder"
        >
          <WishlistCard :list="list" />
        </VcSlidingActions>
      </template>

      <template v-else>
        <WishlistCard
          v-for="list in lists"
          :key="list.id"
          :list="list"
          @settings="openListSettingsDialog(list)"
          @remove="openDeleteListDialog(list)"
        />
      </template>
    </div>

    <!-- Empty -->
    <VcEmptyView v-else :text="$t('pages.account.lists.no_lists')">
      <template #icon>
        <VcImage src="/static/images/common/lists.svg" :alt="$t('pages.account.lists.lists_icon')" />
      </template>

      <template #button>
        <VcButton class="px-6 uppercase" size="lg" @click="openCreateListDialog">
          <i class="fa fa-plus text-inherit -ml-0.5 mr-2.5" />
          {{ $t("pages.account.lists.create_list_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import {
  AddOrUpdateWishlistDialog,
  DeleteWishlistsDialog,
  UnsuccessfulCreateWishlistDialog,
  useWishlists,
  WishlistCard,
  WishlistCardSkeleton,
} from "@/shared/wishlists";
import { WishlistType } from "@/xapi";
import { configInjectionKey, DEFAULT_WISHLIST_LIMIT, usePageHead } from "@/core";
import { usePopup } from "@/shared/popup";

const { t } = useI18n();
const { openPopup } = usePopup();
const { loading, lists, fetchWishlists } = useWishlists();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

usePageHead({
  title: t("pages.account.lists.meta.title"),
});

const config = inject(configInjectionKey);
const listsLimit = config?.wishlists_limit || DEFAULT_WISHLIST_LIMIT;

const creationButtonDisabled = computed(() => lists.value.length >= listsLimit);

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

function itemActionsBuilder() {
  const actions: SlidingActionsItem[] = [
    {
      icon: "fas fa-trash-alt",
      title: t("common.buttons.delete"),
      left: true,
      classes: "bg-[color:var(--color-danger)]",
      clickHandler(list: WishlistType) {
        openDeleteListDialog(list);
      },
    },
    {
      icon: "fas fa-cog",
      title: t("common.buttons.settings"),
      classes: "bg-gray-550",
      clickHandler(list: WishlistType) {
        openListSettingsDialog(list);
      },
    },
  ];

  return actions;
}

fetchWishlists();
</script>
