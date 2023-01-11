<template>
  <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
    <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
      <VcSectionWidget
        :title="$t('pages.checkout.payment_details_section.title')"
        class="shadow-inner pb-8 lg:shadow"
        icon-url="/static/images/checkout/payment.svg"
      >
        <div class="mx-5">
          <CheckoutLabeledBlock :label="$t('pages.checkout.payment_details_section.billing_address_block.title')">
            <template v-if="payment?.billingAddress">
              <div class="truncate">
                <VcAddressInfo v-if="payment?.billingAddress" :address="payment.billingAddress" class="grow text-15" />
              </div>

              <VcButton
                size="sm"
                is-outline
                class="px-3 self-start uppercase font-bold"
                @click="
                  addresses.length
                    ? openSelectAddressModal(AddressType.Billing)
                    : openAddOrUpdateAddressModal(AddressType.Billing, payment?.billingAddress)
                "
              >
                {{ $t("pages.checkout.shipping_details_section.shipping_address_block.change_button") }}
              </VcButton>
            </template>

            <template v-else>
              <div class="text-[color:var(--color-danger)] flex items-center space-x-4">
                <i class="fas fa-exclamation-triangle text-2xl" />

                <span
                  v-if="isAuthenticated"
                  v-t="'pages.checkout.payment_details_section.billing_address_block.no_addresses_message'"
                ></span>

                <span
                  v-else
                  v-t="
                    'pages.checkout.payment_details_section.billing_address_block.unauthenticated_no_addresses_message'
                  "
                ></span>
              </div>

              <div>
                <VcButton
                  size="sm"
                  is-outline
                  class="px-3 self-start uppercase font-bold"
                  @click="
                    addresses.length
                      ? openSelectAddressModal(AddressType.Billing)
                      : openAddOrUpdateAddressModal(AddressType.Billing, payment?.billingAddress)
                  "
                >
                  {{ $t("pages.checkout.payment_details_section.billing_address_block.add_address_button") }}
                </VcButton>
              </div>
            </template>
          </CheckoutLabeledBlock>

          <CheckoutLabeledBlock :label="$t('pages.checkout.payment_details_section.payment_method_block.title')">
            <div class="flex flex-row items-center space-x-4">
              <template v-if="payment?.paymentGatewayCode">
                <VcImage src="/static/images/checkout/invoice.svg" class="h-12 w-12" lazy />
                <span>{{ payment.paymentGatewayCode }}</span>
              </template>

              <div
                v-else
                class="text-gray-600"
                v-t="'pages.checkout.payment_details_section.payment_method_block.not_defined_message'"
              ></div>
            </div>

            <div>
              <VcButton
                size="sm"
                is-outline
                class="px-3 self-start uppercase font-bold"
                @click="openSelectPaymentMethodModal"
              >
                {{
                  payment?.paymentGatewayCode
                    ? $t("pages.checkout.payment_details_section.payment_method_block.change_button")
                    : $t("pages.checkout.payment_details_section.payment_method_block.select_button")
                }}
              </VcButton>
            </div>
          </CheckoutLabeledBlock>
        </div>
      </VcSectionWidget>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AddressType } from "@/core";
import { useUser, useUserAddresses } from "@/shared/account";
import { CheckoutLabeledBlock, useCheckout } from "@/shared/checkout";

const { user, isAuthenticated } = useUser();
const { addresses } = useUserAddresses({ user });
const { payment, openSelectAddressModal, openAddOrUpdateAddressModal, openSelectPaymentMethodModal } = useCheckout();
</script>
