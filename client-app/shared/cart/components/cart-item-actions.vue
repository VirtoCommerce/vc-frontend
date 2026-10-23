<template>
  <template v-if="menuItem">
    <VcMenuItem
      v-if="canSaveForLater"
      color="secondary"
      :disabled="disabled"
      nowrap
      data-test-id="save-for-later-menu-item"
      @click="$emit('saveForLater')"
    >
      <template #prepend>
        <VcIcon name="bookmark" />
      </template>

      <span>{{ $t("pages.cart.save_for_later") }}</span>
    </VcMenuItem>
  </template>

  <div v-else class="cart-item-actions">
    <VcButton
      v-if="canSaveForLater"
      class="cart-item-actions__button"
      color="secondary"
      size="xs"
      truncate
      icon-size="1.25rem"
      prepend-icon="bookmark-solid"
      :variant="selected ? 'no-border' : 'solid-light'"
      :disabled="disabled"
      data-test-id="save-for-later-button"
      @click="$emit('saveForLater')"
    >
      <span>{{ $t("pages.cart.save_for_later") }}</span>
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUser } from "@/shared/account";

interface IEmits {
  (event: "saveForLater"): void;
}

interface IProps {
  selected?: boolean;
  saveableForLater?: boolean;
  disabled?: boolean;
  /** Renders the action as a `VcMenuItem` for a ⋮ menu. */
  menuItem?: boolean;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const { isAuthenticated } = useUser();

const canSaveForLater = computed(() => isAuthenticated.value && props.saveableForLater);
</script>

<style lang="scss">
.cart-item-actions {
  &__button {
    @apply align-middle mt-2;
  }
}
</style>
