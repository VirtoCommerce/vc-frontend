<template>
  <VcLayout sidebar-position="right" sticky-sidebar>
    <ShippingDetailsSection :cart-id="cartId" />

    <OrderCommentSection v-if="$cfg.checkout_comment_enabled" v-model:comment="comment" class="mt-5" />

    <template #sidebar>
      <OrderSummary :cart="cart!" :selected-items="selectedLineItems" footnote>
        <template #footer>
          <ProceedTo
            :to="{ name: 'Billing' }"
            :disabled="!isValidShipment"
            test-id="checkout.billing-button"
            @click="
              analytics('addShippingInfo', { ...cart!, items: selectedLineItems }, {}, shipment?.shipmentMethodOption)
            "
          >
            {{ $t("common.buttons.go_to_billing") }}
          </ProceedTo>

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="!isValidShipment" color="warning" size="sm" variant="solid-light" class="mt-4" icon>
              {{ $t("common.messages.fill_all_required") }}
            </VcAlert>
          </transition>

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="hasValidationErrors" color="warning" size="sm" variant="solid-light" class="mt-4" icon>
              {{ $t("common.messages.something_went_wrong") }}
            </VcAlert>
          </transition>
        </template>
      </OrderSummary>
    </template>
  </VcLayout>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useAnalytics } from "@/core/composables";
import { useFullCart } from "@/shared/cart";
import { OrderCommentSection, OrderSummary, ProceedTo, ShippingDetailsSection, useCheckout } from "@/shared/checkout";

interface IProps {
  cartId?: string;
}

const props = defineProps<IProps>();

const cartId = toRef(props, "cartId");

const { cart, shipment, selectedLineItems, hasValidationErrors } = useFullCart(cartId.value);
const { comment, isValidShipment } = useCheckout(cartId.value);

const { analytics } = useAnalytics();
</script>
