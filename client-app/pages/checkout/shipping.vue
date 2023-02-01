<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <ShippingDetailsSection
      :shipment="shipment"
      :disabled="loading"
      :availableMethods="availableShippingMethods"
      @change:address="onDeliveryAddressChange"
      @change:method="updateShippingMethod"
    />

    <OrderCommentSection v-if="$cfg.checkout_comment_enabled" v-model:comment="comment" />

    <template #sidebar>
      <OrderSummary :cart="cart" footnote>
        <template #footer>
          <VcButton
            :to="{ name: 'Billing', replace: true }"
            :is-disabled="isDisabledNextStep"
            class="mt-4 uppercase w-full"
          >
            {{ $t("common.buttons.go_to_billing") }}
          </VcButton>

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="!isValidShipment" type="warning" class="mt-4" icon>
              {{ $t("common.messages.fill_all_required") }}
            </VcAlert>
          </transition>

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="isShowInvalidCartWarning" type="warning" class="mt-4" icon>
              {{ $t("common.messages.something_went_wrong") }}
            </VcAlert>
          </transition>
        </template>
      </OrderSummary>
    </template>
  </VcLayoutWithRightSidebar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ShippingMethodType } from "@/xapi";
import { useCart } from "@/shared/cart";
import { OrderCommentSection, OrderSummary, ShippingDetailsSection, useCheckout } from "@/shared/checkout";

const { loading, cart, hasValidationErrors, availableShippingMethods, updateShipment } = useCart();
const { comment, shipment, isValidShipment, onDeliveryAddressChange } = useCheckout();

const isDisabledNextStep = computed<boolean>(
  () => loading.value || hasValidationErrors.value || !isValidShipment.value
);
const isShowInvalidCartWarning = computed<boolean>(() => hasValidationErrors.value);

async function updateShippingMethod(method: ShippingMethodType) {
  await updateShipment({
    id: shipment.value?.id,
    price: method.price?.amount,
    shipmentMethodCode: method.code,
    shipmentMethodOption: method.optionName,
  });
}
</script>
