<template>
  <div class="cart-item-actions">
    <!-- The icon-only button names itself in the kit tooltip on hover. -->
    <VcTooltip v-if="isAuthenticated && saveableForLater" :disabled="!icons" placement="bottom">
      <template #trigger>
        <VcButton
          class="cart-item-actions__button"
          color="secondary"
          size="xs"
          truncate
          icon-size="1.25rem"
          :icon="icons ? 'bookmark-solid' : null"
          :prepend-icon="!icons ? 'bookmark-solid' : null"
          variant="soft"
          :disabled="disabled"
          :aria-label="icons ? $t('pages.cart.save_for_later') : undefined"
          data-test-id="save-for-later-button"
          @click="$emit('saveForLater')"
        >
          <span v-if="!icons">{{ $t("pages.cart.save_for_later") }}</span>
        </VcButton>
      </template>

      <template #content>
        {{ $t("pages.cart.save_for_later") }}
      </template>
    </VcTooltip>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useUser } from "@/shared/account";

interface IEmits {
  (event: "saveForLater"): void;
}

interface IProps {
  saveableForLater?: boolean;
  disabled?: boolean;
  icons?: boolean;
}

defineEmits<IEmits>();

defineProps<IProps>();

const { isAuthenticated } = useUser();
</script>

<style lang="scss">
.cart-item-actions {
  @apply mt-2 flex flex-wrap items-center gap-2;

  &:empty {
    @apply hidden;
  }

  &__button {
    @apply align-middle;
  }
}
</style>
