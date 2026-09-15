<template>
  <VcDropdownMenu :y-offset="4" :x-offset="0" placement="bottom-end">
    <template #trigger="{ triggerProps }">
      <VcButton
        ref="triggerButton"
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
          $emit('edit', triggerElement());
        "
      >
        <template #prepend>
          <VcIcon name="edit" />
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
          $emit('share', triggerElement());
        "
      >
        <template #prepend>
          <VcIcon name="users" />
        </template>

        <span>{{ $t("shared.wishlists.list_card.share_button") }}</span>
      </VcMenuItem>

      <VcMenuItem
        data-test-id="wishlist-card-remove-menu-item"
        color="secondary"
        nowrap
        @click="
          close();
          $emit('remove', triggerElement());
        "
      >
        <template #prepend>
          <VcIcon name="delete-2" class="text-danger" />
        </template>

        <span>{{ $t("shared.wishlists.list_card.remove_list_button") }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";

interface IEmits {
  (event: "edit", triggerElement?: HTMLElement): void;
  (event: "share", triggerElement?: HTMLElement): void;
  (event: "remove", triggerElement?: HTMLElement): void;
}

interface IProps {
  /** Sharing is a corporate feature; without it the menu is rename and remove only. */
  shareable?: boolean;
}

defineEmits<IEmits>();

defineProps<IProps>();

const triggerButton = useTemplateRef<{ $el: HTMLElement }>("triggerButton");

// `close()` only hides the popover body (`display: none`), so by the time a modal opened from here closes, the menu
// item that had the focus is unfocusable and `returnFocus` is a no-op. The trigger stays visible — hand that over.
function triggerElement(): HTMLElement | undefined {
  return triggerButton.value?.$el;
}
</script>
