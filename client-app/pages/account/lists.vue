<template>
  <div class="lists">
    <!-- Title block -->
    <div class="lists__header">
      <VcTypography tag="h1">
        {{ $t("shared.account.navigation.links.lists") }}
      </VcTypography>

      <VcButton
        v-if="lists.length || loading"
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
        <template v-if="loading">
          <WishlistCardSkeleton v-for="item in 5" :key="item" />
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
    </div>

    <!-- Empty -->
    <VcEmptyView v-else :text="$t('pages.account.lists.no_lists')" icon="outline-lists">
      <template #button>
        <VcButton prepend-icon="plus" @click="openCreateListModal">
          {{ $t("pages.account.lists.create_list_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead, useThemeContext } from "@/core/composables";
import { DEFAULT_WISHLIST_LIMIT } from "@/core/constants";
import { useModal } from "@/shared/modal";
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
const { themeContext } = useThemeContext();
const { openModal } = useModal();
const { loading, lists, fetchWishlists } = useWishlists();

usePageHead({
  title: t("pages.account.lists.meta.title"),
});

const listsLimit = themeContext.value?.settings?.wishlists_limit || DEFAULT_WISHLIST_LIMIT;

const creationButtonDisabled = computed(() => lists.value.length >= listsLimit);

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

function openListSettingsModal(list: WishlistType) {
  openModal({
    component: AddOrUpdateWishlistModal,
    props: {
      list,
    },
  });
}

function openDeleteListModal(list: WishlistType) {
  openModal({
    component: DeleteWishlistsModal,
    props: {
      list,
    },
  });
}

void fetchWishlists();
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
