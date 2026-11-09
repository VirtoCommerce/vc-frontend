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
    @apply hidden text-sm font-bold;

    @media (width >= theme("screens.xs")) {
      @apply inline;
    }

    @media print {
      @apply inline;
    }
  }
}
</style>
