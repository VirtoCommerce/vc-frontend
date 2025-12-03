<template>
  <div class="flex items-center gap-1.5">
    <template v-if="sharingSetting.scope === WishlistScopeType.Private">
      <VcIcon :size="16" class="fill-secondary" name="lock-closed" />

      <span>
        {{ $t("shared.wishlists.status.private") }}
      </span>
    </template>

    <template v-else>
      <VcIcon :size="16" class="fill-accent" name="users" />

      <span>
        {{
          sharingSetting.isOwner || sharingSetting.scope === WishlistScopeType.Organization
            ? $t("shared.wishlists.status.shared")
            : $t("shared.wishlists.status.shared_with_me")
        }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { WishlistScopeType } from "@/core/api/graphql/types";
import type { SharingSettingType } from "@/core/api/graphql/types";

interface IProps {
  sharingSetting: SharingSettingType;
}

defineProps<IProps>();
</script>
