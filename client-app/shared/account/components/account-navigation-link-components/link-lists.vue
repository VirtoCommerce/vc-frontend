<template>
  <AccountNavigationItem :item="item">
    <div v-if="isListDetails && lists.length > 0" class="account-navigation-lists">
      <router-link
        v-for="list in lists"
        :key="list.id"
        :to="{ name: 'ListDetails', params: { listId: list.id } }"
        class="account-navigation-lists__item"
        active-class="account-navigation-lists__item--active"
      >
        <VcIcon class="account-navigation-lists__icon fill-primary" size="xs" name="minus" />

        <span class="account-navigation-lists__label">{{ list.name }}</span>
      </router-link>
    </div>
  </AccountNavigationItem>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useWishlists } from "@/shared/wishlists";
import type { ExtendedMenuLinkType } from "@/core/types";
import AccountNavigationItem from "@/shared/account/components/account-navigation-item.vue";

defineProps<IProps>();

const { lists, fetchWishlists } = useWishlists();
const isListDetails = computed(() => ["Lists", "ListDetails"].includes(route.name as string));

interface IProps {
  item: ExtendedMenuLinkType;
}

const route = useRoute();
watchEffect(async () => {
  if (isListDetails.value) {
    await fetchWishlists();
  }
});
</script>

<style lang="scss">
.account-navigation-lists {
  @apply py-2 px-2.5 space-y-0.5;

  &__item {
    @apply flex w-full cursor-pointer items-center gap-2 py-0.5 text-sm px-1.5 rounded;

    &--active {
      @apply font-bold bg-secondary-100;
    }

    &:hover:not(&--active) {
      @apply bg-secondary-50;
    }
  }

  &__icon {
    @apply flex-none;
  }

  &__label {
    @apply line-clamp-2 grow overflow-hidden text-ellipsis text-nowrap text-start;
  }
}
</style>
