<template>
  <div class="secure-checkout-badge">
    <VcIcon size="xs" name="lock-closed" />

    <span class="secure-checkout-badge__label" data-test-id="checkout-layout.secure-checkout-label">
      {{ $t("common.labels.secure_checkout") }}
    </span>
  </div>
</template>

<style lang="scss">
.secure-checkout-badge {
  @apply flex items-center gap-x-1.5 text-neutral;

  @media print {
    @apply -me-px border px-2;
  }

  &__label {
    @apply text-sm font-bold;

    // Below xs only the lock shows; screen readers keep the label.
    @media screen and (width < theme("screens.xs")) {
      @apply sr-only;
    }
  }
}
</style>
