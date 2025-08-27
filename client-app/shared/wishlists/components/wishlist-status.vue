<template>
  <div class="flex items-center gap-1.5">
    <template v-if="scope === WishlistScopeType.Private">
      <VcIcon :size="16" class="fill-secondary" name="lock-closed" />

      <span>
        {{ $t("shared.wishlists.status.private") }}
      </span>
    </template>

    <template v-else>
      <VcIcon :size="16" class="fill-accent" name="users" />

      <span>
        {{ isOwner ? $t("shared.wishlists.status.shared") : $t("shared.wishlists.status.shared_with_me")  }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

interface IProps {
  scope: string;
  createdBy: string;
}
const props = defineProps<IProps>();

const { userName } = globals;
const isOwner = computed(()=> props.createdBy == userName);
</script>
