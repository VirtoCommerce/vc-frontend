<template>
  <ShippingDetailsSection
    :shipment="shipment"
    :disabled="loading"
    @change:address="onDeliveryAddressChange"
    @change:method="openSelectShipmentMethodModal"
  />

  <OrderCommentSection v-model:comment="comment" />
</template>

<script setup lang="ts">
import { OrderCommentSection, ShippingDetailsSection, useCheckout } from "@/shared/checkout";

const { comment, loading, shipment, openSelectShipmentMethodModal, onDeliveryAddressChange } = useCheckout();
</script>
