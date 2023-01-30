<template>
  <div
    :class="[
      'vc-address',
      {
        'vc-address--readonly': readonly,
      },
    ]"
  >
    <template v-if="address">
      <VcAddressLine class="vc-address__line" :address="address" />

      <VcButton v-if="!readonly" class="vc-address__button !w-7 !h-7" is-outline @click="$emit('change')">
        <VcIcon name="pencil" size="xs" />
      </VcButton>
    </template>

    <i18n-t
      v-else
      class="vc-address__no-address"
      keypath="shared.checkout.shipping_details_section.messages.no_addresses_message"
      tag="p"
      scope="global"
    >
      <template v-slot:linkedText>
        <span class="vc-address__link" @click="$emit('change')">
          {{ $t("shared.checkout.shipping_details_section.messages.linked_text") }}
        </span>
      </template>
    </i18n-t>
  </div>
</template>

<script setup lang="ts">
import { OrderAddressType } from "@/xapi";

interface Props {
  readonly?: boolean;
  address?: OrderAddressType;
}

interface Emits {
  (event: "change"): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style lang="scss">
.vc-address {
  $readonly: "";

  @apply grow flex items-center gap-2 p-3;

  &--readonly {
    $readonly: &;
  }

  &__line {
    @apply grow;

    #{$readonly} & {
      @apply text-gray-500;
    }
  }

  &__button {
    @apply shrink-0;
  }

  &__no-address {
    @apply grow text-gray-500;
  }

  &__link {
    @apply border-b border-dashed border-current text-[color:var(--color-link)] cursor-pointer;

    &:hover {
      @apply text-[color:var(--color-link-hover)];
    }
  }
}
</style>
