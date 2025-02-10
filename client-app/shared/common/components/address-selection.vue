<template>
  <div
    :class="[
      'vc-address-selection',
      {
        'vc-address-selection--readonly': readonly,
        'vc-address-selection--disabled': disabled,
      },
    ]"
  >
    <template v-if="address">
      <AddressLine class="vc-address-selection__address" :address="address" />

      <VcButton
        v-if="!readonly"
        :disabled="disabled"
        variant="outline"
        icon
        size="xs"
        class="vc-address-selection__button"
        @click="$emit('change')"
      >
        <VcIcon name="edit" size="xs" />
      </VcButton>
    </template>

    <p v-else class="vc-address-selection__no-address">
      {{ $t("common.prefixes.please") }}
      <button
        data-test-id="select-address-button"
        type="button"
        class="vc-address-selection__link"
        @click="!readonly && $emit('change')"
      >
        {{ placeholder || $t("common.placeholders.select_address") }}
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import AddressLine from "./address-line.vue";
import type { AnyAddressType } from "@/core/types";

interface IEmits {
  (event: "change"): void;
}

interface IProps {
  readonly?: boolean;
  disabled?: boolean;
  address?: AnyAddressType;
  placeholder?: string;
}

defineEmits<IEmits>();
defineProps<IProps>();
</script>

<style lang="scss">
.vc-address-selection {
  $readonly: "";
  $disabled: "";

  @apply flex items-center gap-4 text-sm;

  &--readonly {
    $readonly: &;
  }

  &--disabled {
    $disabled: &;
  }

  &__address {
    @apply grow [word-break:break-word];

    #{$readonly} &,
    #{$disabled} & {
      @apply text-neutral;
    }
  }

  &__button {
    @apply shrink-0;
  }

  &__no-address {
    @apply grow select-none text-neutral;
  }

  &__link {
    @apply appearance-none lowercase border-b border-dashed border-current text-[--link-color];

    &:hover {
      @apply text-[--link-hover-color];
    }

    #{$disabled} & {
      @apply text-neutral pointer-events-none;
    }
  }
}
</style>
