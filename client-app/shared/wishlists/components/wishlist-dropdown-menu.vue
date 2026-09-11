<template>
  <VcDropdownMenu :y-offset="4" :x-offset="0" placement="bottom-end">
    <template #trigger="{ triggerProps }">
      <VcButton
        data-test-id="wishlist-card-menu-button"
        :aria-label="$t('common.labels.actions')"
        icon
        color="secondary"
        variant="outline"
        size="xs"
        v-bind="triggerProps"
      >
        <VcIcon name="cog" variant="solid" />
      </VcButton>
    </template>

    <template #content="{ close }">
      <VcMenuItem
        data-test-id="wishlist-card-edit-menu-item"
        color="secondary"
        nowrap
        @click="
          close();
          $emit('edit');
        "
      >
        <template #prepend>
          <VcIcon name="pencil" />
        </template>

        <span>{{ $t("shared.wishlists.list_card.rename_list_button") }}</span>
      </VcMenuItem>

      <VcMenuItem
        v-if="shareable"
        data-test-id="wishlist-card-share-menu-item"
        color="secondary"
        nowrap
        @click="
          close();
          $emit('share');
        "
      >
        <template #prepend>
          <VcIcon name="users" />
        </template>

        <span>{{ $t("shared.wishlists.list_card.share_button") }}</span>
      </VcMenuItem>

      <VcMenuItem
        data-test-id="wishlist-card-remove-menu-item"
        color="danger"
        nowrap
        @click="
          close();
          $emit('remove');
        "
      >
        <template #prepend>
          <VcIcon name="trash-2" />
        </template>

        <span class="text-danger">{{ $t("shared.wishlists.list_card.remove_list_button") }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "edit"): void;
  (event: "share"): void;
  (event: "remove"): void;
}

interface IProps {
  /** Sharing is a corporate feature; without it the menu is rename and remove only. */
  shareable?: boolean;
}

defineEmits<IEmits>();

defineProps<IProps>();
</script>
