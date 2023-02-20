<template>
  <div v-if="order">
    <VcBreadcrumbs :items="breadcrumbs" class="mx-5 md:mx-0" />

    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between md:mx-0" :class="{ '-mb-3': executed }">
      <h2 class="text-3xl font-bold uppercase text-gray-800">
        {{
          executed
            ? $t("pages.account.order_payment.processed_title", [order.number])
            : $t("pages.account.order_payment.title")
        }}
      </h2>
    </div>

    <!-- Subtitle block -->
    <div v-if="executed" class="mx-5 gap-x-4 md:mx-0 md:flex">
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
      <div class="w-full grow lg:w-3/4 xl:w-4/5">
        <div
          :class="executed ? 'md:bg-white md:border md:shadow-sm' : 'bg-white border shadow-sm'"
          class="px-9 py-6 md:overflow-hidden md:rounded"
        >
          <!-- Successful payment -->
          <VcEmptyPage
            v-if="success"
            image="/static/images/payment/payment-successful.png"
            mobile-image="/static/images/payment/payment-successful.png"
            class="-mx-9 -mt-16 -mb-24 md:-mt-6 lg:pl-14"
          >
            <template #description>
              <h2
                v-t="'pages.account.order_payment.success.title'"
                class="text-black-800 mb-3 text-center text-2xl font-semibold lg:text-left"
              />

              <p v-t="'pages.account.order_payment.success.text'" class="mb-8 max-w-md text-center lg:text-left" />
            </template>

            <template #actions>
              <div class="hidden flex-wrap gap-x-5 gap-y-4 md:flex">
                <VcButton
                  :to="{ name: 'OrderDetails', params: { orderId }, replace: true }"
                  class="px-5 uppercase"
                  is-outline
                >
                  <i class="fas fa-arrow-left -ml-1 mr-2.5" />
                  {{ $t("pages.account.order_payment.back_to_order_button") }}
                </VcButton>

                <VcButton :to="{ name: 'Orders', replace: true }" class="w-40 px-5 uppercase">
                  {{ $t("pages.account.order_payment.orders_list_button") }}
                </VcButton>
              </div>

              <VcButton :to="{ name: 'Catalog', replace: true }" class="w-48 uppercase md:!hidden">
                {{ $t("pages.account.order_payment.continue_shopping_button") }}
              </VcButton>
            </template>
          </VcEmptyPage>

          <!-- Payment failure -->
          <VcEmptyPage
            v-else-if="failure"
            image="/static/images/payment/payment-failed.png"
            mobile-image="/static/images/payment/payment-failed.png"
            class="-mx-9 -mt-16 -mb-24 md:-mt-6 lg:pl-14"
          >
            <template #description>
              <h2
                v-t="'pages.account.order_payment.failure.title'"
                class="text-black-800 mb-3 text-center text-2xl font-semibold lg:text-left"
              />

              <p v-t="'pages.account.order_payment.failure.text'" class="mb-8 max-w-md text-center lg:text-left" />
            </template>

            <template #actions>
              <VcButton class="w-48 uppercase" @click="tryAgain">
                {{ $t("pages.account.order_payment.try_again_button") }}
              </VcButton>
            </template>
          </VcEmptyPage>

          <!-- Main content -->
          <template v-else>
            <!-- region Billing address -->
            <h5 v-t="'pages.account.order_payment.billing_address_label'" class="mb-1 font-extrabold" />

            <div class="mb-6 rounded border">
              <div class="flex flex-row justify-between space-x-3 p-4 md:p-5">
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
                    <span v-t="'pages.account.order_payment.phone_label'" class="font-extrabold" />
                    {{ payment?.billingAddress?.phone }}
                  </p>

                  <p class="truncate">
                    <span v-t="'pages.account.order_payment.email_label'" class="font-extrabold" />
                    {{ payment?.billingAddress?.email }}
                  </p>
                </div>

                <div class="self-start md:self-center">
                  <VcButton
                    :is-disabled="paymentMethodComponent?.loading || loading"
                    :is-waiting="changeAddressLoading"
                    size="sm"
                    is-outline
                    class="!hidden self-start px-5 font-bold uppercase md:!inline-flex"
                    @click="showEditAddressDialog"
                  >
                    {{ $t("pages.account.order_payment.edit_button") }}
                  </VcButton>

                  <!-- TODO: use VcButton -->
                  <button
                    :disabled="paymentMethodComponent?.loading || loading"
                    type="button"
                    class="h-8 w-8 rounded text-[color:var(--color-primary)] shadow hover:bg-gray-100 md:hidden"
                    @click="paymentMethodComponent?.loading || loading ? null : showEditAddressDialog()"
                  >
                    <i class="fas fa-pencil-alt text-lg" />
                  </button>
                </div>
              </div>
            </div>
            <!-- endregion Billing address -->

            <!-- region Payment method -->
            <h5 v-t="'pages.account.order_payment.payment_method_label'" class="mb-1 font-extrabold" />

            <div class="overflow-hidden rounded border">
              <div class="flex flex-row items-center justify-between space-x-3 p-4 shadow-lg md:p-5">
                <div class="min-w-0 truncate">
                  <VcImage
                    :src="payment?.paymentMethod?.logoUrl"
                    class="mr-3.5 inline-block h-8 w-8 object-center md:h-9 md:w-9"
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
                    class="!hidden self-start px-5 font-bold uppercase md:!inline-flex"
                    @click="showChangePaymentMethodDialog"
                  >
                    {{ $t("pages.account.order_payment.edit_button") }}
                  </VcButton>

                  <!-- TODO: use VcButton -->
                  <button
                    :disabled="paymentMethodComponent?.loading || loading"
                    type="button"
                    class="h-8 w-8 rounded text-[color:var(--color-primary)] shadow hover:bg-gray-100 md:hidden"
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
        class="order-first mb-6 flex-col px-5 md:px-0 lg:order-1 lg:mb-0 lg:w-1/4"
      >
        <OrderSummary :cart="order" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useUserOrder } from "@/shared/account";
import { AddOrUpdateAddressModal, OrderSummary, SelectPaymentMethodModal } from "@/shared/checkout";
import {
  PaymentProcessingAuthorizeNet,
  PaymentMethod,
  PaymentProcessingManual,
  PaymentProcessingRedirection,
} from "@/shared/payment";
import { usePopup } from "@/shared/popup";
import { InputOrderAddressType, OrderPaymentMethodType, PaymentInType } from "@/xapi/types";

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
const { loading, order, fetchOrder, addOrUpdatePayment } = useUserOrder();
const { openPopup, closePopup } = usePopup();
const router = useRouter();

usePageHead({
  title: computed(() => [
    t("pages.account.order_details.meta.title", [order.value?.number]),
    t("pages.account.order_payment.meta.title"),
  ]),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.orders"), route: { name: "Orders" } },
  {
    title: t("pages.account.order_payment.processed_title", [order.value?.number]),
    route: { name: "OrderDetails", params: { orderId: props.orderId } },
  },
  { title: t("pages.account.order_payment.breadcrumb_title") },
]);

const executed = computed<boolean>(() => success.value || failure.value);
const payment = computed<PaymentInType | undefined>(() => order.value?.inPayments[0]);
const paymentMethodType = computed<PaymentMethod | undefined>(() => payment.value?.paymentMethod?.paymentMethodType);

function tryAgain() {
  location.reload();
}

function showEditAddressDialog() {
  openPopup({
    component: AddOrUpdateAddressModal,
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
    component: SelectPaymentMethodModal,
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
    fetchOrder({ id: props.orderId });
  } else if (order.value?.inPayments[0]?.isApproved) {
    // If the order is paid
    router.replace({ name: "OrderDetails", params: { orderId: props.orderId } });
  }
});
</script>
