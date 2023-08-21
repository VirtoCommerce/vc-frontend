<template>
  <div>
    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between lg:mx-0">
      <h2 class="text-3xl font-bold uppercase text-gray-800">
        {{ $t("shared.account.navigation.links.lists") }}
      </h2>

      <VcButton
        v-if="lists.length || loading"
        :disabled="creationButtonDisabled"
        size="sm"
        variant="outline"
        prepend-icon="plus"
        @click="openCreateListModal"
      >
        <span class="hidden sm:inline">{{ $t("pages.account.lists.create_list_button") }}</span>
        <span class="sm:hidden">{{ $t("pages.account.lists.create_list_button_mobile") }}</span>
      </VcButton>
    </div>

    <!-- Skeletons -->
    <div v-if="loading" class="flex flex-col divide-y lg:space-y-3 lg:divide-none">
      <WishlistCardSkeleton v-for="item in 5" :key="item" />
    </div>

    <!-- Lists -->
    <div v-else-if="lists.length" class="flex flex-col overflow-x-hidden lg:gap-y-3 lg:overflow-x-visible">
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
          @settings="openListSettingsModal(list)"
          @remove="openDeleteListModal(list)"
        />
      </template>
    </div>

    <!-- Empty -->
    <VcEmptyView v-else :text="$t('pages.account.lists.no_lists')">
      <template #icon>
        <VcImage src="/static/images/common/lists.svg" :alt="$t('pages.account.lists.lists_icon')" />
      </template>

      <template #button>
        <VcButton prepend-icon="plus" @click="openCreateListModal">
          {{ $t("pages.account.lists.create_list_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { DEFAULT_WISHLIST_LIMIT } from "@/core/constants";
import { configInjectionKey } from "@/core/injection-keys";
import { usePopup } from "@/shared/popup";
import {
  AddOrUpdateWishlistModal,
  DeleteWishlistsModal,
  UnsuccessfulCreateWishlistModal,
  useWishlists,
  WishlistCard,
  WishlistCardSkeleton,
} from "@/shared/wishlists";
import type { WishlistType } from "@/core/api/graphql/types";

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

function openCreateListModal() {
  if (creationButtonDisabled.value) {
    openPopup({
      component: UnsuccessfulCreateWishlistModal,
    });
  } else {
    openPopup({
      component: AddOrUpdateWishlistModal,
    });
  }
}

function openListSettingsModal(list: WishlistType) {
  openPopup({
    component: AddOrUpdateWishlistModal,
    props: {
      list,
    },
  });
}

function openDeleteListModal(list: WishlistType) {
  openPopup({
    component: DeleteWishlistsModal,
    props: {
      list,
    },
  });
}

function itemActionsBuilder() {
  const actions: SlidingActionsItem[] = [
    {
      icon: "trash",
      title: t("common.buttons.delete"),
      left: true,
      classes: "bg-[--color-danger-500]",
      clickHandler(list: WishlistType) {
        openDeleteListModal(list);
      },
    },
    {
      icon: "cog",
      title: t("common.buttons.settings"),
      classes: "bg-[--color-neutral-500]",
      clickHandler(list: WishlistType) {
        openListSettingsModal(list);
      },
    },
  ];

  return actions;
}

fetchWishlists();
</script>
