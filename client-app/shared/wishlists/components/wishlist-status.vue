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
        {{ $t(statusKey) }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useWishlistSharingScopes } from "../composables/useWishlistSharingScopes";
import type { SharingSettingType } from "@/core/api/graphql/types";

interface IProps {
  sharingSetting: SharingSettingType;
}

const props = defineProps<IProps>();

const { getSharingScope } = useWishlistSharingScopes();

const statusKey = computed(() => {
  // A scope published to a single target reads differently for its owner than the generic "Shared".
  const contributed = getSharingScope(props.sharingSetting.scope)?.statusKey;

  if (props.sharingSetting.isOwner && contributed) {
    return contributed;
  }

  return props.sharingSetting.isOwner || props.sharingSetting.scope === WishlistScopeType.Organization
    ? "shared.wishlists.status.shared"
    : "shared.wishlists.status.shared_with_me";
});
</script>
