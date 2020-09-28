<template>
  <div class="d-flex flex-column">
    <div class="mt-1">
      <div class="d-flex">
        {{ $t('shopping-cart.subtotal') }} <span class="ml-auto font-weight-bold">{{ cart.subTotal.formattedAmount }}</span>
      </div>
      <div class="d-flex">
        {{ $t('shopping-cart.shipping') }} <span class="ml-auto font-weight-bold">{{ cart.shippingTotal.formattedAmount }}</span>
      </div>
      <div class="d-flex">
        {{ $t('shopping-cart.total') }} <span class="ml-auto font-weight-bold">{{ cart.subTotal.formattedAmount }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./cart-summary.ts"></script>
