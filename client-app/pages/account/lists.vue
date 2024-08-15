<template>
  <div>
    <!-- Title block -->
    <div class="flex items-center justify-between">
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
        <span class="hidden sm:inline">{{ $t("pages.account.lists.create_list_button") }}</span>
        <span class="sm:hidden">{{ $t("pages.account.lists.create_list_button_mobile") }}</span>
      </VcButton>
    </div>

    <!-- Skeletons -->
    <div v-if="loading" class="flex flex-col divide-y lg:space-y-3 lg:divide-none">
      <WishlistCardSkeleton v-for="item in 5" :key="item" />
    </div>

    <!-- Lists -->
    <div v-else-if="lists.length" class="space-y-3 md:space-y-2.5">
      <WishlistCard
        v-for="list in lists"
        :key="list.id"
        :list="list"
        @set-scope="setScope(list.id, $event)"
        @settings="openListSettingsModal(list)"
        @remove="openDeleteListModal(list)"
      />
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
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { DEFAULT_WISHLIST_LIMIT } from "@/core/constants";
import { configInjectionKey } from "@/core/injection-keys";
import { useModal } from "@/shared/modal";
import {
  AddOrUpdateWishlistModal,
  DeleteWishlistsModal,
  UnsuccessfulCreateWishlistModal,
  useWishlists,
  WishlistCard,
  WishlistCardSkeleton,
} from "@/shared/wishlists";
import type { WishlistScopeType, WishlistType } from "@/core/api/graphql/types";

const { t } = useI18n();
const { openModal } = useModal();
const { loading, lists, fetchWishlists, updateWishlist } = useWishlists();

usePageHead({
  title: t("pages.account.lists.meta.title"),
});

const config = inject(configInjectionKey);
const listsLimit = config?.wishlists_limit || DEFAULT_WISHLIST_LIMIT;

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

async function setScope(listId: string, scope: WishlistScopeType) {
  await updateWishlist({ listId, scope });
}

fetchWishlists();
</script>
