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

    <template #content>
      <VcMenuItem data-test-id="wishlist-card-edit-menu-item" color="secondary" nowrap @click="$emit('edit')">
        <template #prepend>
          <VcIcon name="edit" />
        </template>

        <span>{{ $t("shared.wishlists.list_card.list_edit_button") }}</span>
      </VcMenuItem>

      <VcMenuItem data-test-id="wishlist-card-remove-menu-item" color="secondary" nowrap @click="$emit('remove')">
        <VcIcon name="delete-2" class="text-danger" />

        <span>{{ $t("shared.wishlists.list_card.remove_list_button") }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
interface IEmit {
  (event: "edit"): void;
  (event: "remove"): void;
}

defineEmits<IEmit>();
</script>
