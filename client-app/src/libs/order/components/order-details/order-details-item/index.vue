<template>
  <div>
    <b-card-text>{{ item.name }}</b-card-text>
    <b-card-text>
      <span class="font-weight-bold">{{ $t("account.orders.order-details.sku") }}</span>
      {{ item.sku }}
    </b-card-text>
    <b-card-text>
      <span class="font-weight-bold">{{ $t("account.orders.order-details.unit-price") }}</span>
      {{ item.placedPrice.formattedAmount }}
    </b-card-text>
    <b-card-text>
      <span class="font-weight-bold">{{ $t("account.orders.order-details.quantity") }}</span>
      {{ item.quantity }}
    </b-card-text>
  </div>
</template>

<script lang="ts" src="./order-details-item"></script>
