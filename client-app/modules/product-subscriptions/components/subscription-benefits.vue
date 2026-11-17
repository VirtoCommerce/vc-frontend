<template>
  <ul class="subscription-benefits">
    <li class="subscription-benefits__item">
      <VcIcon class="subscription-benefits__icon" name="circle-check" size="xs" />
      {{ $t("product_subscriptions.purchase_options.benefit_reminder") }}
    </li>

    <li class="subscription-benefits__item">
      <VcIcon class="subscription-benefits__icon" name="circle-check" size="xs" />
      {{ $t("product_subscriptions.purchase_options.benefit_cancel") }}
    </li>
  </ul>
</template>

<style lang="scss">
.subscription-benefits {
  @apply flex flex-col gap-1 text-xs text-neutral-700;

  &__item {
    @apply flex items-start gap-1.5;
  }

  // On the first line of a wrapped text, in the success colour.
  &__icon {
    --vc-icon-color: var(--color-success-600);

    @apply mt-0.5 flex-none;
  }
}
</style>
