<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <BillingDetailsSection
      v-model:address-equals-shipping-address="billingAddressEqualsShipping"
      :payment="payment"
      :disabled="loading"
      @change:address="onBillingAddressChange"
      @change:method="openSelectPaymentMethodModal"
    />

    <template #sidebar>
      <OrderSummary :cart="cart" footnote>
        <template #footer>
          <!-- Purchase order number -->
          <transition name="slide-fade-top" mode="in-out" appear>
            <VcActionInput
              v-if="$cfg.checkout_purchase_order_enabled"
              v-model="purchaseOrderNumber"
              :label="$t('common.labels.purchase_order_number')"
              :placeholder="$t('common.placeholders.purchase_order_number')"
              :is-applied="purchaseOrderNumberIsApplied"
              :is-disabled="loading"
              :max-length="128"
              class="mt-4"
              @click:apply="setPurchaseOrderNumber"
              @click:deny="removePurchaseOrderNumber"
            />
          </transition>

          <VcButton
            :is-disabled="isDisabledOrderCreation"
            :is-waiting="creatingOrder"
            class="mt-4 uppercase w-full"
            @click="createOrder"
          >
            {{ $t("common.buttons.place_order") }}
          </VcButton>

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="!isValidPayment" type="warning" class="mt-4" icon>
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
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useCart, usePurchaseOrderNumber } from "@/shared/cart";
import { BillingDetailsSection, OrderSummary, useCheckout } from "@/shared/checkout";

const router = useRouter();
const { loading: loadingCart, cart, hasValidationErrors, fetchCart } = useCart();
const {
  billingAddressEqualsShipping,
  payment,
  isValidPayment,
  isValidCheckout,
  openSelectPaymentMethodModal,
  onBillingAddressChange,
  createOrderFromCart,
} = useCheckout();
const { purchaseOrderNumber, purchaseOrderNumberIsApplied, setPurchaseOrderNumber, removePurchaseOrderNumber } =
  usePurchaseOrderNumber();

const creatingOrder = ref(false);

const loading = computed<boolean>(() => loadingCart.value || creatingOrder.value);
const isDisabledOrderCreation = computed<boolean>(() => loading.value || !isValidCheckout.value);
const isShowInvalidCartWarning = computed<boolean>(() => hasValidationErrors.value && !creatingOrder.value);

async function createOrder(): Promise<void> {
  creatingOrder.value = true;

  const order = await createOrderFromCart();

  if (order) {
    await router.replace({
      name: "OrderCompleted",
      params: {
        orderId: order.id,
        orderNumber: order.number,
      },
    });
  }

  await fetchCart();

  creatingOrder.value = false;
}
</script>
