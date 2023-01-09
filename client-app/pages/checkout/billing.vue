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
                  @click="addresses.length ? openAddressSelectionDialog() : openAddOrUpdateAddressDialog()"
                >
                  {{ $t("pages.checkout.shipping_details_section.shipping_address_block.add_address_button") }}
                </VcButton>
              </div>
            </template>
          </CheckoutLabeledBlock>

          <CheckoutLabeledBlock :label="$t('pages.checkout.payment_details_section.payment_method_block.title')">
            <div class="flex flex-row items-center space-x-4">
              <template v-if="payment?.paymentGatewayCode">
                <VcImage src="/static/images/checkout/invoice.svg" class="h-12 w-12" lazy />
                <span>{{}}</span>
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
                @click="showPaymentMethodDialog"
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
import { computed, onMounted } from "vue";
import { omit } from "lodash";
import {
  AddOrUpdateAddressDialog,
  CheckoutLabeledBlock,
  PaymentMethodDialog,
  SelectAddressDialog,
} from "@/shared/checkout";
import { usePopup } from "@/shared/popup";
import { useCart } from "@/shared/cart";
import { useUser, useUserAddresses } from "@/shared/account";
import {
  CartAddressType,
  //createOrderFromCart,
  InputAddressType,
  MemberAddressType,
  PaymentMethodType,
  PaymentType,
} from "@/xapi";
import { AddressType, convertToType /*useGoogleAnalytics*/ } from "@/core";
//import { useNotifications } from "@/shared/notification";
//import { useRouter } from "vue-router";
//import { useI18n } from "vue-i18n";

//const { t } = useI18n();
//const router = useRouter();
const { user, isAuthenticated } = useUser();
const { cart, fetchCart, updatePayment } = useCart();
const { addresses, fetchAddresses } = useUserAddresses({ user });
const { openPopup, closePopup } = usePopup();
//const ga = useGoogleAnalytics();
//const notifications = useNotifications();

const availablePaymentMethods = computed<PaymentMethodType[]>(() => cart.value.availablePaymentMethods ?? []);
const payment = computed<PaymentType | undefined>(() => cart.value.payments?.[0]);

function openAddressSelectionDialog(): void {
  openPopup({
    component: SelectAddressDialog,
    props: {
      addresses: addresses.value,
      currentAddress: convertToType<MemberAddressType>(payment.value?.billingAddress),

      async onResult(selectedAddress: MemberAddressType): Promise<void> {
        selectedAddress.addressType = AddressType.Billing;
        await updatePayment({
          id: payment.value?.id,
          billingAddress: convertToType<InputAddressType>(omit(selectedAddress, ["isDefault", "description"])),
        });
        closePopup();
      },

      onAddNewAddress() {
        setTimeout(() => {
          openAddOrUpdateAddressDialog();
        }, 500);
      },
    },
  });
}

function openAddOrUpdateAddressDialog(currentAddress?: CartAddressType): void {
  openPopup({
    component: AddOrUpdateAddressDialog,
    props: {
      address: currentAddress,

      async onResult(updatedAddress: MemberAddressType): Promise<void> {
        updatedAddress.addressType = AddressType.Billing;
        await updatePayment({
          id: payment.value?.id,
          billingAddress: convertToType<InputAddressType>(omit(updatedAddress, ["isDefault", "description"])),
        });
        closePopup();
      },
    },
  });
}

function showPaymentMethodDialog(): void {
  openPopup({
    component: PaymentMethodDialog,
    props: {
      currentMethodCode: payment.value?.paymentGatewayCode,
      availableMethods: availablePaymentMethods.value,
      async onResult(method: PaymentMethodType) {
        await updatePayment({
          id: payment.value?.id,
          paymentGatewayCode: method.code,
        });
      },
    },
  });
}

/*async function createOrder(): Promise<void> {
  if (billingAddressEqualsShippingAddress.value) {
    await updatePayment({
      id: payment.value?.id,
      billingAddress: convertToType<InputAddressType>(
        omit(cart.value!.shipments?.[0].deliveryAddress, ["isDefault", "description"])
      ),
      amount: cart.value!.total!.amount,
    });
  }

  ga.addPaymentInfo(cart.value);

  const order = await createOrderFromCart(cart.value.id!);

  if (!order) {
    notifications.error({
      text: t("common.messages.creating_order_error"),
      duration: 15000,
      single: true,
    });

    return;
  }

  await router.push({
    name: "CheckoutComplete",
    params: {
      orderId: order.id,
      orderNumber: order.number,
    },
  });

  await fetchCart();
}*/

onMounted(async () => {
  await fetchCart();
  await fetchAddresses();
});
</script>
