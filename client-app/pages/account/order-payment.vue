<template>
  <div v-if="order">
    <VcBreadcrumbs :items="breadcrumbs" class="mx-5 md:mx-0" />

    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{
          success || failure
            ? $t("pages.account.order_payment.processed_title", [order.number])
            : $t("pages.account.order_payment.title")
        }}
      </h2>
    </div>

    <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
      <!-- Main section -->
      <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
        <div class="bg-white md:rounded border shadow-sm px-9 py-6">
          <!-- Successful payment -->
          <PaymentSuccess v-if="success" class="-mx-9 -my-6">
            <template #actions>
              <VcButton
                :to="{ name: 'OrderDetails', params: { orderId }, replace: true }"
                class="px-5 uppercase"
                is-outline
              >
                <i class="fas fa-arrow-left -ml-1 mr-2.5" />
                {{ $t("pages.account.order_payment.back_to_order_button") }}
              </VcButton>

              <VcButton :to="{ name: 'Orders', replace: true }" class="px-5 uppercase w-40">
                {{ $t("pages.account.order_payment.orders_list_button") }}
              </VcButton>
            </template>
          </PaymentSuccess>

          <!-- Payment failure -->
          <PaymentFailure v-else-if="failure" class="-mx-9 -my-6">
            <template #actions>
              <VcButton class="px-5 uppercase md:w-40" @click="tryAgain">
                {{ $t("pages.account.order_payment.try_again_button") }}
              </VcButton>
            </template>
          </PaymentFailure>

          <!-- Main content -->
          <template v-else>
            <!-- region Billing address -->
            <h5 class="mb-1 font-extrabold" v-t="'pages.account.order_payment.billing_address_label'" />

            <div class="rounded border mb-6">
              <div class="p-4 md:p-5 flex flex-row justify-between space-x-3 text-sm">
                <!-- TODO: create an atom component to display address -->
                <div class="min-w-0">
                  <span class="font-extrabold line-clamp-2">
                    {{ payment?.billingAddress?.firstName }}
                    {{ payment?.billingAddress?.lastName }}
                  </span>

                  <p class="line-clamp-3">
                    {{ payment?.billingAddress?.countryCode }}
                    {{ payment?.billingAddress?.regionName }}
                    {{ payment?.billingAddress?.city }}
                    {{ payment?.billingAddress?.line1 }}
                    {{ payment?.billingAddress?.line2 }}
                    {{ payment?.billingAddress?.postalCode }}
                  </p>

                  <p class="truncate">
                    <span class="font-extrabold" v-t="'pages.account.order_payment.phone_label'" />
                    {{ payment?.billingAddress?.phone }}
                  </p>

                  <p class="truncate">
                    <span class="font-extrabold" v-t="'pages.account.order_payment.email_label'" />
                    {{ payment?.billingAddress?.email }}
                  </p>
                </div>

                <div class="self-start md:self-center">
                  <VcButton
                    :is-disabled="paymentMethodRef?.loading"
                    :is-waiting="loading"
                    size="sm"
                    is-outline
                    class="!hidden md:!inline-flex px-5 self-start uppercase font-bold"
                    @click="editAddress"
                  >
                    {{ $t("pages.account.order_payment.edit_button") }}
                  </VcButton>

                  <!-- TODO: use VcButton -->
                  <button
                    :disabled="paymentMethodRef?.loading || loading"
                    type="button"
                    class="md:hidden h-8 w-8 shadow rounded text-[color:var(--color-primary)] hover:bg-gray-100"
                    @click="paymentMethodRef?.loading || loading ? null : editAddress()"
                  >
                    <i class="fas fa-pencil-alt text-lg" />
                  </button>
                </div>
              </div>
            </div>
            <!-- endregion Billing address -->

            <!-- region Payment method -->
            <h5 class="mb-1 font-extrabold" v-t="'shared.payment.payment_method_section.header'" />

            <div class="rounded border overflow-hidden">
              <div class="p-4 md:px-6 md:py-5 shadow-lg">
                <svg width="43" height="37" class="inline-block text-gray-400 opacity-80 mr-3 md:mr-5">
                  <use href="/static/images/payment/bank-card.svg#main" />
                </svg>

                <span>{{ $t("pages.account.order_payment.bank_card_title") }}</span>
              </div>

              <div class="p-5 md:p-6">
                <PaymentProcessingAuthorizeNet
                  v-if="isAuthorizeNetPaymentMethod"
                  ref="paymentMethodRef"
                  :order="order"
                  @success="success = true"
                  @fail="failure = true"
                />
              </div>
            </div>
            <!-- endregion Payment method -->
          </template>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col px-5 mb-6 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4">
        <OrderSummary :cart="order" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { InputOrderAddressType, PaymentInType } from "@/xapi/graphql/types";
import { AddOrUpdateAddressDialog, OrderSummary } from "@/shared/checkout";
import { PaymentProcessingAuthorizeNet, PaymentFailure, PaymentSuccess } from "@/shared/payment";
import { useI18n } from "vue-i18n";
import { useUserOrder } from "@/shared/account";
import { useRouter } from "vue-router";
import { usePopup } from "@/shared/popup";

const props = defineProps({
  orderId: {
    type: String,
    default: "",
  },
});

const success = ref(false);
const failure = ref(false);
const paymentMethodRef = ref<InstanceType<typeof PaymentProcessingAuthorizeNet> | null>(null);

const { t } = useI18n();
const { loading, order, loadOrder, updatePayment } = useUserOrder();
const { openPopup, closePopup } = usePopup();
const router = useRouter();

const payment = computed<PaymentInType | undefined>(() => order.value?.inPayments[0]);

const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.orders"), route: { name: "Orders" } },
  {
    title: t("pages.account.order_payment.processed_title", [order.value?.number]),
    route: { name: "OrderDetails", params: { orderId: props.orderId } },
  },
  { title: t("pages.account.order_payment.breadcrumb_title") },
]);

const isAuthorizeNetPaymentMethod = computed<boolean>(() =>
  (payment.value?.gatewayCode?.toLowerCase() ?? "").includes("authorizenet")
);

function tryAgain() {
  location.reload();
}

function editAddress() {
  openPopup({
    component: AddOrUpdateAddressDialog,
    props: {
      address: payment.value?.billingAddress,
      onResult(address: InputOrderAddressType) {
        closePopup();
        updatePayment({
          orderId: props.orderId,
          payment: {
            id: payment.value!.id,
            billingAddress: address,
          },
        });
      },
    },
  });
}

watchEffect(() => {
  if (props.orderId !== order.value?.id) {
    loadOrder({ id: props.orderId });
  } else if (order.value?.inPayments[0]?.isApproved) {
    // If the order is paid
    router.replace({ name: "OrderDetails", params: { orderId: props.orderId } });
  }
});
</script>
