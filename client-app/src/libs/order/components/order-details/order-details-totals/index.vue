<template>
  <div class="row">
    <div class="col-md-6">
      <div class="list-group list-group-flush">
        <div class="list-group-item d-flex justify-content-between">
          <span class="font-weight-bold">{{ $t("account.orders.order-details.subtotal") }}</span>
          {{ order.subTotal ? order.subTotal.formattedAmount : "" }}
        </div>
        <div class="list-group-item d-flex justify-content-between">
          <span class="font-weight-bold">{{ $t("account.orders.order-details.shipping") }}</span>
          {{ order.shippingTotal.amount == 0 ? $t("account.orders.order-details.free") : order.shippingTotal.formattedAmount }}
        </div>
        <div class="list-group-item d-flex justify-content-between">
          <span class="font-weight-bold">{{ $t("account.orders.order-details.total") }}</span>
          {{ order.total ? order.total.formattedAmount : "" }}
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="list-group list-group-flush">
        <div class="list-group-item d-flex justify-content-between">
          <span class="font-weight-bold">{{ $t("account.orders.order-details.created-by") }}</span>
          {{ order.createdBy ? order.createdBy : "" }}
        </div>
        <div class="list-group-item d-flex justify-content-between">
          <span class="font-weight-bold">{{ $t("account.orders.order-details.status") }}</span>
          {{ order.status ? order.status : "" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./order-details-totals"></script>
