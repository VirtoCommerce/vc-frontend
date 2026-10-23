<template>
  <VcChip
    v-if="chip"
    :color="isPrivate ? 'neutral' : 'success'"
    :icon="isPrivate ? 'lock' : 'users'"
    variant="outline"
    size="sm"
    rounded
    nowrap
  >
    {{ statusText }}
  </VcChip>

  <div v-else class="flex items-center gap-1.5">
    <template v-if="sharingSetting.scope === WishlistScopeType.Private">
      <VcIcon :size="16" class="text-info-700" name="lock-closed" />

      <span>
        {{ $t("shared.wishlists.status.private") }}
      </span>
    </template>

    <template v-else>
      <VcIcon :size="16" class="text-primary" name="users" />

      <span>
        {{ statusText }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useWishlistSharingScopes } from "../composables/useWishlistSharingScopes";
import type { SharingSettingType } from "@/core/api/graphql/types";

interface IProps {
  sharingSetting: SharingSettingType;
  /** Renders the status as an outlined chip (record cards). */
  chip?: boolean;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { getSharingScope } = useWishlistSharingScopes();

// Targets come back for the owner of a targeted scope and for nobody else.
const recipientCount = computed(() => props.sharingSetting.targets?.length ?? 0);

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

const isPrivate = computed(() => props.sharingSetting.scope === WishlistScopeType.Private);

// The count is always passed, zero included: a named `count` is what picks the plural form, and `t(key)` without it
// resolves to the singular, so a scope left with no recipients would otherwise read "Shared with 1 customer".
const statusText = computed(() =>
  isPrivate.value ? t("shared.wishlists.status.private") : t(statusKey.value, { count: recipientCount.value }),
);
</script>
