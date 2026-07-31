<template>
  <div class="flex items-center gap-1.5">
    <template v-if="sharingSetting.scope === WishlistScopeType.Private">
      <VcIcon :size="16" class="text-info-700" name="lock-closed" />

      <span>
        {{ $t("shared.wishlists.status.private") }}
      </span>
    </template>

    <template v-else>
      <VcIcon :size="16" class="text-primary" name="users" />

      <span>
        {{ $t(`shared.wishlists.status.${statusKey}`) }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import type { SharingSettingType } from "@/core/api/graphql/types";

interface IProps {
  sharingSetting: SharingSettingType;
}

const props = defineProps<IProps>();

const statusKey = computed(() => {
  // A rep's own Customer-scoped list is published to one customer organization, which reads differently from
  // the generic "Shared" used by the link/organization scopes (VCST-5332).
  if (props.sharingSetting.isOwner && props.sharingSetting.scope === WishlistScopeType.Customer) {
    return "shared_with_customer";
  }

  return props.sharingSetting.isOwner || props.sharingSetting.scope === WishlistScopeType.Organization
    ? "shared"
    : "shared_with_me";
});
</script>
