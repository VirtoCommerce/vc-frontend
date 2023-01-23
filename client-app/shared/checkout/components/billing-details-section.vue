<template>
  <VcSectionWidget :title="$t('shared.checkout.billing_details_section.title')" icon="cash">
    <CheckoutLabeledBlock :label="$t('shared.checkout.billing_details_section.labels.shipping_address')">
      <div class="grow">
        <VcCheckbox
          v-model="billingAddressEqualsShippingAddress"
          :disabled="disabled"
          name="billingAddressEqualsShippingAddress"
        >
          {{ $t("shared.checkout.billing_details_section.labels.same_as_shipping_address") }}
        </VcCheckbox>

        <div
          v-if="!billingAddressEqualsShippingAddress"
          class="flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-3 lg:items-center -mx-5 mt-5 p-5 pb-0 border-t"
        >
          <template v-if="payment?.billingAddress">
            <VcAddressInfo :address="payment.billingAddress" class="grow text-15" />

            <div>
              <VcButton
                :is-disabled="disabled"
                size="sm"
                is-outline
                class="px-3 uppercase"
                @click="$emit('change:address')"
              >
                {{ $t("common.buttons.change") }}
              </VcButton>
            </div>
          </template>

          <template v-else>
            <div class="text-[color:var(--color-danger)] flex items-center space-x-4">
              <i class="fas fa-exclamation-triangle text-2xl" />
              <span>
                {{
                  isAuthenticated
                    ? $t("shared.checkout.billing_details_section.messages.no_addresses")
                    : $t("shared.checkout.billing_details_section.messages.unauthenticated_no_addresses")
                }}
              </span>
            </div>

            <div>
              <VcButton
                :is-disabled="disabled"
                size="sm"
                is-outline
                class="px-3 uppercase"
                @click="$emit('change:address')"
              >
                {{ $t("common.buttons.new_address") }}
              </VcButton>
            </div>
          </template>
        </div>
      </div>
    </CheckoutLabeledBlock>

    <CheckoutLabeledBlock :label="$t('shared.checkout.billing_details_section.labels.shipping_method')">
      <div class="flex flex-row items-center space-x-4">
        <template v-if="payment?.paymentGatewayCode">
          <VcImage src="/static/images/checkout/invoice.svg" class="h-12 w-12" lazy />
          <span>{{ payment.paymentGatewayCode }}</span>
        </template>

        <span v-else class="text-gray-600">
          {{ $t("common.messages.not_defined") }}
        </span>
      </div>

      <div>
        <VcButton :is-disabled="disabled" size="sm" is-outline class="px-3 uppercase" @click="$emit('change:method')">
          {{ payment?.paymentGatewayCode ? $t("common.buttons.change") : $t("common.buttons.select") }}
        </VcButton>
      </div>
    </CheckoutLabeledBlock>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { PaymentType } from "@/xapi";
import { CheckoutLabeledBlock } from "@/shared/checkout";
import { useUser } from "@/shared/account";

interface Props {
  disabled?: boolean;
  addressEqualsShippingAddress?: boolean;
  payment?: PaymentType;
}

interface Emits {
  (event: "change:address"): void;
  (event: "change:method"): void;
  (event: "update:addressEqualsShippingAddress"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { isAuthenticated } = useUser();

const billingAddressEqualsShippingAddress = useVModel(props, "addressEqualsShippingAddress", emit);
</script>
