<template>
  <VcBadge
    color="info"
    size="md"
    :title="$t('shared.catalog.purchased_before_badge.title')"
    class="min-h-4.5 px-1"
    data-testid="purchased-before-badge"
  >
    <VcIcon name="cart-check" size="xs" />
  </VcBadge>
</template>
