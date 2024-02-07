<template>
  <VcWidget :title="$t('shared.checkout.billing_details_section.title')" prepend-icon="cash" size="lg">
    <div class="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div class="lg:w-3/5">
        <VcLabel required>
          {{ $t("shared.checkout.billing_details_section.labels.billing_address") }}
        </VcLabel>

        <div :class="['grow divide-y rounded border', { 'cursor-not-allowed bg-gray-50': disabled }]">
          <VcCheckbox
            v-if="!allItemsAreDigital"
            v-model="billingAddressEqualsShipping"
            :disabled="disabled"
            name="billingAddressEqualsShipping"
            class="p-3"
          >
            {{ $t("shared.checkout.billing_details_section.labels.same_as_shipping_address") }}
          </VcCheckbox>

          <VcAddressSelection
            :placeholder="
              !allItemsAreDigital && billingAddressEqualsShipping
                ? $t('shared.checkout.shipping_details_section.links.select_address')
                : $t('shared.checkout.billing_details_section.links.select_address')
            "
            :address="billingAddress"
            :disabled="disabled"
            :readonly="!allItemsAreDigital && billingAddressEqualsShipping"
            class="min-h-[3.313rem] px-3 py-1.5"
            @change="onBillingAddressChange"
          />
        </div>
      </div>

      <div class="space-y-3 lg:w-2/5">
        <VcSelect
          :model-value="paymentMethod"
          :label="$t('shared.checkout.billing_details_section.labels.payment_method')"
          :items="availablePaymentMethods"
          :disabled="disabled"
          size="auto"
          required
          @change="(value) => setPaymentMethod(value)"
        >
          <template #placeholder>
            <VcSelectItem>
              <VcSelectItemImage src="/static/icons/placeholders/select-payment.svg" class="bg-gray-100/80" />
              <VcSelectItemText>
                {{ $t("common.placeholders.select_payment_method") }}
              </VcSelectItemText>
            </VcSelectItem>
          </template>

          <template #selected="{ item }">
            <VcSelectItem>
              <VcSelectItemImage :src="item.logoUrl" />
              <VcSelectItemText>{{ $t(`common.methods.payment_by_code.${item.code}`) }}</VcSelectItemText>
            </VcSelectItem>
          </template>

          <template #item="{ item }">
            <VcSelectItem bordered>
              <VcSelectItemImage :src="item.logoUrl" />
              <VcSelectItemText>{{ $t(`common.methods.payment_by_code.${item.code}`) }}</VcSelectItemText>
            </VcSelectItem>
          </template>
        </VcSelect>

        <transition name="slide-fade-top" mode="in-out">
          <VcInput
            v-if="isPurchaseOrderNumberEnabled"
            v-model.trim="purchaseOrderNumber"
            :placeholder="$t('common.placeholders.purchase_order_number')"
            :disabled="disabled"
            name="purchaseOrderNumber"
          />
        </transition>
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables";

interface IProps {
  disabled?: boolean;
}

defineProps<IProps>();

const { availablePaymentMethods } = useFullCart();
const {
  allItemsAreDigital,
  billingAddressEqualsShipping,
  billingAddress,
  paymentMethod,
  onBillingAddressChange,
  setPaymentMethod,
  isPurchaseOrderNumberEnabled,
  purchaseOrderNumber,
} = useCheckout();
</script>
