<template>
  <VcDropdownMenu :y-offset="4" :x-offset="0" placement="bottom-end">
    <template #trigger="{ triggerProps }">
      <VcButton icon="cog" color="secondary" variant="outline" size="xs" v-bind="triggerProps" />
    </template>

    <template #content>
      <VcMenuItem color="secondary" nowrap @click="$emit('edit')">
        <template #prepend>
          <VcIcon name="edit" />
        </template>

        <span>{{ $t("shared.wishlists.list_card.list_edit_button") }}</span>
      </VcMenuItem>

      <template v-if="isCorporateMember && currentScope">
        <VcMenuItem
          v-if="currentScope === WishlistScopeType.Private"
          color="secondary"
          nowrap
          @click="$emit('setScope', WishlistScopeType.Organization)"
        >
          <VcIcon name="users" class="fill-accent" />

          <span>{{ $t("shared.wishlists.list_card.share_button") }}</span>
        </VcMenuItem>

        <VcMenuItem
          v-else-if="currentScope === WishlistScopeType.Organization"
          color="secondary"
          nowrap
          @click="$emit('setScope', WishlistScopeType.Private)"
        >
          <VcIcon name="lock-closed" />

          <span>{{ $t("shared.wishlists.list_card.make_private_button") }}</span>
        </VcMenuItem>
      </template>

      <VcMenuItem color="secondary" nowrap @click="$emit('remove')">
        <VcIcon name="delete-2" class="fill-danger" />

        <span>{{ $t("shared.wishlists.list_card.remove_list_button") }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
import { WishlistScopeType } from "@/core/api/graphql/types";

interface IEmit {
  (event: "edit"): void;
  (event: "remove"): void;
  (event: "setScope", scope: WishlistScopeType): void;
}

interface IProps {
  currentScope?: WishlistScopeType;
  isCorporateMember: boolean;
}

defineEmits<IEmit>();

defineProps<IProps>();
</script>
