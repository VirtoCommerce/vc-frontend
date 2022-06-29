<template>
  <div v-if="order">
    <VcBreadcrumbs :items="breadcrumbs" class="mx-5 md:mx-0" />

    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0" :class="{ '-mb-3': executed }">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{
          executed
            ? $t("pages.account.order_payment.processed_title", [order.number])
            : $t("pages.account.order_payment.title")
        }}
      </h2>
    </div>

    <!-- Subtitle block -->
    <div v-if="executed" class="md:flex mx-5 md:mx-0 gap-x-4">
      <div class="text-sm">
        <span class="font-bold">
          {{ $t("pages.account.order_payment.order_date") }}
        </span>
        {{ $d(order.createdDate, "short") }}
      </div>

      <div class="text-sm">
        <span class="font-bold">
          {{ $t("pages.account.order_payment.status_label") }}
        </span>

        {{ order.status }}
      </div>
    </div>

    <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
      <!-- Main section -->
      <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
        <div
          :class="executed ? 'md:bg-white md:border md:shadow-sm' : 'bg-white border shadow-sm'"
          class="md:rounded px-9 py-6 md:overflow-hidden"
        >
          <!-- Successful payment -->
          <VcEmptyPage
            v-if="success"
            image="/static/images/payment/payment-successful.png"
            mobile-image="/static/images/payment/payment-successful.png"
            class="-mx-9 -mt-16 md:-mt-6 -mb-24 lg:pl-14"
          >
            <template #description>
              <h2
                class="text-black-800 text-center lg:text-left text-2xl font-semibold mb-3"
                v-t="'pages.account.order_payment.success.title'"
              />

              <p class="mb-8 text-center lg:text-left max-w-md" v-t="'pages.account.order_payment.success.text'" />
            </template>

            <template #actions>
              <div class="hidden md:flex flex-wrap gap-x-5 gap-y-4">
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
              </div>

              <VcButton :to="{ name: 'Catalog', replace: true }" class="md:!hidden uppercase w-48">
                {{ $t("pages.account.order_payment.continue_shopping_button") }}
              </VcButton>
            </template>
          </VcEmptyPage>

          <!-- Payment failure -->
          <VcEmptyPage
            v-else-if="failure"
            image="/static/images/payment/payment-failed.png"
            mobile-image="/static/images/payment/payment-failed.png"
            class="-mx-9 -mt-16 md:-mt-6 -mb-24 lg:pl-14"
          >
            <template #description>
              <h2
                class="text-black-800 text-center lg:text-left text-2xl font-semibold mb-3"
                v-t="'pages.account.order_payment.failure.title'"
              />

              <p class="mb-8 text-center lg:text-left max-w-md" v-t="'pages.account.order_payment.failure.text'" />
            </template>

            <template #actions>
              <VcButton class="uppercase w-48" @click="tryAgain">
                {{ $t("pages.account.order_payment.try_again_button") }}
              </VcButton>
            </template>
          </VcEmptyPage>

          <!-- Main content -->
          <template v-else>
            <!-- region Billing address -->
            <h5 class="mb-1 font-extrabold" v-t="'pages.account.order_payment.billing_address_label'" />

            <div class="rounded border mb-6">
              <div class="p-4 md:p-5 flex flex-row justify-between space-x-3">
                <!-- TODO: create an atom component to display address -->
                <div class="min-w-0 text-sm">
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
                    :is-disabled="paymentMethodComponent?.loading || loading"
                    :is-waiting="changeAddressLoading"
                    size="sm"
                    is-outline
                    class="!hidden md:!inline-flex px-5 self-start uppercase font-bold"
                    @click="showEditAddressDialog"
                  >
                    {{ $t("pages.account.order_payment.edit_button") }}
                  </VcButton>

                  <!-- TODO: use VcButton -->
                  <button
                    :disabled="paymentMethodComponent?.loading || loading"
                    type="button"
                    class="md:hidden h-8 w-8 shadow rounded text-[color:var(--color-primary)] hover:bg-gray-100"
                    @click="paymentMethodComponent?.loading || loading ? null : showEditAddressDialog()"
                  >
                    <i class="fas fa-pencil-alt text-lg" />
                  </button>
                </div>
              </div>
            </div>
            <!-- endregion Billing address -->

            <!-- region Payment method -->
            <h5 class="mb-1 font-extrabold" v-t="'pages.account.order_payment.payment_method_label'" />

            <div class="rounded border overflow-hidden">
              <div class="flex flex-row items-center justify-between space-x-3 p-4 md:p-5 shadow-lg">
                <div class="min-w-0 truncate">
                  <VcImage
                    :src="payment?.paymentMethod?.logoUrl"
                    class="h-8 w-8 md:h-9 md:w-9 object-center inline-block mr-3.5"
                    lazy
                  />

                  <span>{{ payment?.paymentMethod?.typeName }}</span>
                </div>

                <div>
                  <VcButton
                    :is-disabled="paymentMethodComponent?.loading || loading"
                    :is-waiting="changeMethodLoading"
                    size="sm"
                    is-outline
                    class="!hidden md:!inline-flex px-5 self-start uppercase font-bold"
                    @click="showChangePaymentMethodDialog"
                  >
                    {{ $t("pages.account.order_payment.edit_button") }}
                  </VcButton>

                  <!-- TODO: use VcButton -->
                  <button
                    :disabled="paymentMethodComponent?.loading || loading"
                    type="button"
                    class="md:hidden h-8 w-8 shadow rounded text-[color:var(--color-primary)] hover:bg-gray-100"
                    @click="paymentMethodComponent?.loading || loading ? null : showChangePaymentMethodDialog()"
                  >
                    <i class="fas fa-pencil-alt text-lg" />
                  </button>
                </div>
              </div>

              <div class="p-5 md:p-6">
                <PaymentProcessingManual
                  v-if="[PaymentMethod.Unknown, PaymentMethod.Standard].includes(paymentMethodType!)"
                />

                <PaymentProcessingRedirection
                  v-else-if="paymentMethodType === PaymentMethod.Redirection"
                  :order="order"
                  :disabled="loading"
                />

                <PaymentProcessingAuthorizeNet
                  v-else-if="paymentMethodType === PaymentMethod.PreparedForm"
                  ref="paymentMethodComponent"
                  :order="order"
                  :disabled="loading"
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
      <div
        :class="executed ? 'hidden md:flex' : 'flex'"
        class="flex-col px-5 mb-6 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4"
      >
        <OrderSummary :cart="order" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { InputOrderAddressType, OrderPaymentMethodType, PaymentInType } from "@/xapi/types";
import { AddOrUpdateAddressDialog, OrderSummary, PaymentMethodDialog } from "@/shared/checkout";
import {
  PaymentProcessingAuthorizeNet,
  PaymentMethod,
  PaymentProcessingManual,
  PaymentProcessingRedirection,
} from "@/shared/payment";
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
const changeAddressLoading = ref(false);
const changeMethodLoading = ref(false);
const paymentMethodComponent = ref<InstanceType<typeof PaymentProcessingAuthorizeNet> | null>(null);

const { t } = useI18n();
const { loading, order, loadOrder, addOrUpdatePayment } = useUserOrder();
const { openPopup, closePopup } = usePopup();
const router = useRouter();

const executed = computed<boolean>(() => success.value || failure.value);
const payment = computed<PaymentInType | undefined>(() => order.value?.inPayments[0]);
const paymentMethodType = computed<PaymentMethod | undefined>(() => payment.value?.paymentMethod?.paymentMethodType);

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

function tryAgain() {
  location.reload();
}

function showEditAddressDialog() {
  openPopup({
    component: AddOrUpdateAddressDialog,
    props: {
      address: payment.value?.billingAddress,
      async onResult(address: InputOrderAddressType) {
        closePopup();
        changeAddressLoading.value = true;

        await addOrUpdatePayment({
          orderId: props.orderId,
          payment: {
            id: payment.value!.id,
            billingAddress: address,
          },
        });

        changeAddressLoading.value = false;
      },
    },
  });
}

function showChangePaymentMethodDialog(): void {
  openPopup({
    component: PaymentMethodDialog,
    props: {
      currentMethodCode: payment.value?.gatewayCode,
      availableMethods: order.value?.availablePaymentMethods,
      async onResult(method: OrderPaymentMethodType) {
        if (payment.value?.gatewayCode === method.code) {
          return;
        }

        changeMethodLoading.value = true;

        await addOrUpdatePayment({
          orderId: props.orderId,
          payment: {
            id: payment.value!.id,
            paymentGatewayCode: method.code,
          },
        });

        changeMethodLoading.value = false;
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
