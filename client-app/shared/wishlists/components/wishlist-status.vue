<template>
  <div class="flex items-center gap-1.5">
    <template v-if="scope === WishlistScopeType.Private">
      <VcIcon :size="16" class="text-[--color-secondary-500]" name="lock-closed" />

      <span>
        {{ $t("shared.wishlists.status.private") }}
      </span>
    </template>

    <template v-else-if="scope === WishlistScopeType.Organization">
      <VcIcon :size="16" class="text-[--color-accent-500]" name="users" />

      <span>
        {{ $t("shared.wishlists.status.shared") }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { WishlistScopeType } from "@/core/api/graphql/types/base.generated";
interface IProps {
  scope: string;
}
defineProps<IProps>();
</script>
