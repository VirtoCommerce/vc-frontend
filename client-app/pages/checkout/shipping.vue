<template>
  <ShippingDetailsSection
    :shipment="shipment"
    :disabled="loading"
    :availableShippingMethods="availableShippingMethods"
    @change:address="onDeliveryAddressChange"
    @change:method="openSelectShipmentMethodModal"
  />

  <OrderCommentSection v-model:comment="comment" />
</template>

<script setup lang="ts">
import { OrderCommentSection, ShippingDetailsSection, useCheckout } from "@/shared/checkout";
import { useCart } from "@/shared/cart";

const { availableShippingMethods } = useCart();
const { comment, loading, shipment, openSelectShipmentMethodModal, onDeliveryAddressChange } = useCheckout();
</script>
