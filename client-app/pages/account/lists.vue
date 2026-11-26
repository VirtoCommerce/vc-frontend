<template>
  <div class="lists">
    <!-- Title block -->
    <div class="lists__header">
      <VcTypography tag="h1">
        {{ $t("shared.account.navigation.links.lists") }}
      </VcTypography>

      <VcButton
        v-if="lists.length || loading"
        data-test-id="create-wishlist-button"
        :disabled="creationButtonDisabled"
        size="sm"
        variant="outline"
        prepend-icon="plus"
        @click="openCreateListModal"
      >
        <span class="lists__create-button-label lists__create-button-label--full">
          {{ $t("pages.account.lists.create_list_button") }}
        </span>

        <span class="lists__create-button-label lists__create-button-label--short">
          {{ $t("pages.account.lists.create_list_button_mobile") }}
        </span>
      </VcButton>
    </div>

    <!-- Lists / Skeletons -->
    <div v-if="loading || lists.length" class="lists__container">
      <div class="lists__items">
        <template v-if="showSkeletons">
          <WishlistCardSkeleton v-for="item in 10" :key="item" />
        </template>

        <template v-else>
          <WishlistCard
            v-for="list in lists"
            :key="list.id"
            :list="list"
            @settings="openListSettingsModal(list, $event)"
            @share="openShareListModal(list, $event)"
            @remove="openDeleteListModal(list, $event)"
          />
        </template>
      </div>
    </div>

    <!-- Empty -->
    <VcEmptyView
      v-else
      reason="no-data"
      entity="lists"
      :text="$t('pages.account.lists.empty_states.no_data.title')"
      :description="$t('pages.account.lists.empty_states.no_data.description')"
    >
      <template #button>
        <VcButton data-test-id="create-wishlist-button" prepend-icon="plus" @click="openCreateListModal">
          {{ $t("pages.account.lists.create_list_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import { invoke } from "@vueuse/core";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead, useThemeContext } from "@/core/composables";
import { DEFAULT_WISHLIST_LIMIT } from "@/core/constants";
import { useModal } from "@/shared/modal";
import {
  AddOrUpdateWishlistModal,
  DeleteWishlistsModal,
  ShareWishlistModal,
  UnsuccessfulCreateWishlistModal,
  useWishlists,
  WishlistCard,
  WishlistCardSkeleton,
} from "@/shared/wishlists";
import type { WishlistType } from "@/core/api/graphql/types";

const { t } = useI18n();
const { themeContext } = useThemeContext();
const { openModal } = useModal();
const { loading, lists, fetchWishlists } = useWishlists();

usePageHead({
  title: t("pages.account.lists.meta.title"),
});

const listsLimit = themeContext.value?.settings?.wishlists_limit || DEFAULT_WISHLIST_LIMIT;

// `lists` is module-scoped and survives navigation, so on a revisit only this page's own flag knows it is stale.
const listsFetching = ref(true);

const creationButtonDisabled = computed(() => lists.value.length >= listsLimit);
// Not the shared `loading` alone: a save from the Rename or Share dialog raises it for its refetch, and swapping the
// cards out then takes away the menu trigger the dialog hands the focus back to.
const showSkeletons = computed(() => listsFetching.value || (loading.value && !lists.value.length));

function openCreateListModal() {
  if (creationButtonDisabled.value) {
    openModal({
      component: UnsuccessfulCreateWishlistModal,
    });
  } else {
    openModal({
      component: AddOrUpdateWishlistModal,
    });
  }
}

// `triggerElement` comes from the card's menu: the menu item that was clicked is hidden by the time the modal
// closes, so focus has to return to the still-visible trigger instead.
function openListSettingsModal(list: WishlistType, triggerElement?: HTMLElement) {
  openModal({
    triggerElement,
    component: AddOrUpdateWishlistModal,
    props: {
      list,
    },
  });
}

function openShareListModal(list: WishlistType, triggerElement?: HTMLElement) {
  openModal({
    triggerElement,
    component: ShareWishlistModal,
    props: {
      list,
    },
  });
}

function openDeleteListModal(list: WishlistType, triggerElement?: HTMLElement) {
  openModal({
    triggerElement,
    component: DeleteWishlistsModal,
    props: {
      list,
    },
  });
}

void invoke(async () => {
  try {
    await fetchWishlists();
  } finally {
    listsFetching.value = false;
  }
});
</script>

<style lang="scss">
.lists {
  &__header {
    @apply flex items-center justify-between;
  }

  &__create-button-label {
    &--full {
      @apply hidden;

      @media (min-width: theme("screens.sm")) {
        @apply inline;
      }
    }

    &--short {
      @media (min-width: theme("screens.sm")) {
        @apply hidden;
      }
    }
  }

  &__container {
    @apply @container;
  }

  &__items {
    @apply space-y-3;

    @container (min-width: theme("containers.xl")) {
      @apply grid grid-cols-[fit-content(40%)_minmax(0,1fr)_auto_auto_auto] gap-y-2.5 space-y-0;
    }
  }
}
</style>
