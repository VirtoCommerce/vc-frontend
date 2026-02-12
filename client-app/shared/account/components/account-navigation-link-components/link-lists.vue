<template>
  <AccountNavigationItem :item="item">
    <div v-if="isListDetails && lists.length > 0" class="account-navigation-lists">
      <VcMenuItem
        v-for="list in lists"
        :key="list.id"
        :to="{ name: 'ListDetails', params: { listId: list.id } }"
        :active="isActive(list.id)"
        class="account-navigation-lists__item"
        size="xs"
        color="secondary"
      >
        <template #prepend>
          <VcIcon size="xs" name="minus" />
        </template>
        {{ list.name }}
      </VcMenuItem>
    </div>
  </AccountNavigationItem>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useWishlists } from "@/shared/wishlists";
import type { ExtendedMenuLinkType } from "@/core/types";
import AccountNavigationItem from "@/shared/account/components/account-navigation-item.vue";

interface IProps {
  item: ExtendedMenuLinkType;
}

defineProps<IProps>();

const route = useRoute();

const { lists, fetchWishlists } = useWishlists();
const isListDetails = computed(() => ["Lists", "ListDetails"].includes(route.name as string));

function isActive(listId: string) {
  return route.name === "ListDetails" && route.params.listId === listId;
}

watchEffect(async () => {
  if (isListDetails.value) {
    await fetchWishlists();
  }
});
</script>

<style lang="scss">
.account-navigation-lists {
  @apply py-2 pr-2 pl-2.5 space-y-0.5;

  &__item {
    --vc-menu-item-px: 0.375rem;

    @apply rounded;
  }
}
</style>
