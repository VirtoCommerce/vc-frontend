<template>
  <div
    :class="[
      'vc-address',
      {
        'vc-address--readonly': readonly,
      },
    ]"
  >
    <VcLabel v-if="label" :text="label" />
    <div class="vc-address__body">
      <div class="vc-address__before">
        <slot name="before" />
      </div>

      <div class="vc-address__main">
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

      <div class="vc-address__after">
        <slot name="after" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OrderAddressType } from "@/xapi";

interface Props {
  readonly?: boolean;
  label?: string;
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

  @apply flex flex-col gap-1.5;

  &--readonly {
    $readonly: &;
  }

  &__body {
    @apply flex flex-col min-h-[4.625rem] rounded border text-15;
  }

  &__before {
    @apply p-3 border-b empty:hidden;
  }

  &__main {
    @apply grow flex items-center gap-2 p-3;
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

  &__after {
    @apply p-3 border-t empty:hidden;
  }
}
</style>
