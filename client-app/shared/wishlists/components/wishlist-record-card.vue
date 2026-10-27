<template>
  <VcRecordCard
    class="wishlist-record-card"
    data-test-id="wishlist-card"
    :title="list.name"
    :to="{ name: 'ListDetails', params: { listId: list.id } }"
    :description="list.description"
    :meta="meta"
  >
    <template v-if="list.sharingSetting?.access === WishlistAccessType.Write" #actions>
      <WishlistDropdownMenu
        :shareable="isCorporateMember && !!list.sharingSetting?.isOwner"
        :removable="!!list.sharingSetting?.isOwner"
        compact
        @edit="$emit('settings', $event)"
        @share="$emit('share', $event)"
        @remove="$emit('remove', $event)"
      />
    </template>

    <template #status>
      <span class="wishlist-record-card__status">
        <VcChip color="warning" variant="outline" size="sm" rounded nowrap>
          {{ itemsCountText }}
        </VcChip>

        <WishlistStatus v-if="isCorporateMember && list.sharingSetting" :sharing-setting="list.sharingSetting" chip />
      </span>
    </template>
  </VcRecordCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { WishlistAccessType } from "@/core/api/graphql/types";
import { useUser } from "@/shared/account/composables/useUser";
import WishlistDropdownMenu from "./wishlist-dropdown-menu.vue";
import WishlistStatus from "./wishlist-status.vue";
import type { WishlistType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "settings", triggerElement?: HTMLElement): void;
  (event: "share", triggerElement?: HTMLElement): void;
  (event: "remove", triggerElement?: HTMLElement): void;
}

interface IProps {
  list: WishlistType;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const { t, d } = useI18n();
const { isCorporateMember } = useUser();

const itemsCountText = computed(() => t("shared.wishlists.list_card.items_count", props.list.itemsCount ?? 0));

const meta = computed<VcRecordCardMetaItemType[]>(() =>
  props.list.modifiedDate ? [{ icon: "history", text: d(props.list.modifiedDate, "short") }] : [],
);
</script>

<style lang="scss">
.wishlist-record-card {
  &__status {
    @apply flex items-center gap-1.5;
  }
}
</style>
