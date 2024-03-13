<template>
  <div v-if="order">
    <div class="space-y-3">
      <VcBreadcrumbs :items="breadcrumbs" />

      <VcTypography tag="h1">
        {{
          executed
            ? $t("pages.account.order_payment.processed_title", [order.number])
            : $t("pages.account.order_payment.title")
        }}
      </VcTypography>
    </div>

    <!-- Subtitle block -->
    <div v-if="executed" class="gap-x-4 md:flex">
      <div class="text-sm">
        <span class="font-bold">
          {{ $t("pages.account.order_payment.order_date") }}
        </span>
        {{ $d(order.createdDate) }}
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
          class="overflow-hidden p-6 max-lg:-mx-6 md:rounded lg:px-9"
        >
          <!-- Successful payment -->
          <VcEmptyPage
            v-if="success"
            image="/static/images/payment/payment-successful.webp"
            mobile-image="/static/images/payment/payment-successful.webp"
            class="-mx-6 -mb-24 -mt-16 md:-mt-6 lg:-mx-9 lg:pl-14"
          >
            <template #description>
              <h2
                v-t="'pages.account.order_payment.success.title'"
                class="text-black-800 mb-3 text-center text-2xl font-semibold lg:text-left"
              />

              <p v-t="'pages.account.order_payment.success.text'" class="mb-8 max-w-md text-center lg:text-left" />
            </template>

            <template #actions>
              <div class="flex flex-wrap justify-center gap-5 lg:justify-start">
                <VcButton
                  :to="{ name: 'OrderDetails', params: { orderId }, replace: true }"
                  variant="outline"
                  prepend-icon="chevron-left"
                >
                  {{ $t("pages.account.order_payment.back_to_order_button") }}
                </VcButton>

                <VcButton :to="{ name: 'Orders', replace: true }" class="lg:min-w-[10rem]">
                  {{ $t("pages.account.order_payment.orders_list_button") }}
                </VcButton>

                <VcButton :to="{ name: 'Catalog', replace: true }">
                  {{ $t("pages.account.order_payment.continue_shopping_button") }}
                </VcButton>
              </div>
            </template>
          </VcEmptyPage>

          <!-- Payment failure -->
          <VcEmptyPage
            v-else-if="failure"
            image="/static/images/payment/payment-failed.webp"
            mobile-image="/static/images/payment/payment-failed.webp"
            class="-mx-9 -mb-24 -mt-16 md:-mt-6 lg:pl-14"
          >
            <template #description>
              <h2
                v-t="'pages.account.order_payment.failure.title'"
                class="text-black-800 mb-3 text-center text-2xl font-semibold lg:text-left"
              />

              <p v-t="'pages.account.order_payment.failure.text'" class="mb-8 max-w-md text-center lg:text-left" />
            </template>

            <template #actions>
              <VcButton class="w-48" @click="tryAgain">
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
                  <span class="line-clamp-2 font-extrabold">
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
                    :disabled="paymentMethodComponent?.loading || loading"
                    :loading="changeAddressLoading"
                    size="sm"
                    variant="outline"
                    class="!hidden self-start md:!inline-flex"
                    @click="showEditAddressModal"
                  >
                    {{ $t("pages.account.order_payment.edit_button") }}
                  </VcButton>

                  <VcButton
                    :disabled="paymentMethodComponent?.loading || loading"
                    class="md:!hidden"
                    size="sm"
                    icon="pencil"
                    variant="outline"
                    @click="paymentMethodComponent?.loading || loading ? null : showEditAddressModal()"
                  />
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
                    class="mr-3.5 inline-block size-8 object-center md:size-9"
                    lazy
                  />

                  <span>{{ $t(`common.methods.payment_by_code.${payment?.paymentMethod?.code}`) }}</span>
                </div>

                <div>
                  <VcButton
                    :disabled="paymentMethodComponent?.loading || loading"
                    :loading="changeMethodLoading"
                    size="sm"
                    variant="outline"
                    class="!hidden self-start px-5 font-bold uppercase md:!inline-flex"
                    @click="showChangePaymentMethodModal"
                  >
                    {{ $t("pages.account.order_payment.edit_button") }}
                  </VcButton>

                  <VcButton
                    :disabled="paymentMethodComponent?.loading || loading"
                    class="md:!hidden"
                    size="sm"
                    icon="pencil"
                    variant="outline"
                    @click="paymentMethodComponent?.loading || loading ? null : showChangePaymentMethodModal()"
                  />
                </div>
              </div>

              <div class="p-5 md:p-6">
                <PaymentProcessingManual
                  v-if="[PaymentActionType.Unknown, PaymentActionType.Standard].includes(paymentMethodType!)"
                />

                <PaymentProcessingRedirection
                  v-else-if="paymentMethodType === PaymentActionType.Redirection"
                  :order="order"
                  :disabled="loading"
                />

                <PaymentProcessingAuthorizeNet
                  v-else-if="paymentTypeName === 'AuthorizeNetPaymentMethod'"
                  ref="paymentMethodComponent"
                  :order="order"
                  :disabled="loading"
                  @success="success = true"
                  @fail="failure = true"
                />

                <PaymentProcessingSkyflow
                  v-else-if="paymentTypeName === 'SkyflowPaymentMethod'"
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
      <div :class="executed ? 'hidden md:flex' : 'flex'" class="order-first mb-6 flex-col lg:order-1 lg:mb-0 lg:w-1/4">
        <OrderSummary :cart="order" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useUserOrder } from "@/shared/account";
import { OrderSummary, SelectPaymentMethodModal } from "@/shared/checkout";
import { useModal } from "@/shared/modal";
import {
  PaymentProcessingAuthorizeNet,
  PaymentActionType,
  PaymentProcessingManual,
  PaymentProcessingRedirection,
} from "@/shared/payment";
import type { InputOrderAddressType, OrderPaymentMethodType, PaymentInType } from "@/core/api/graphql/types";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";
import PaymentProcessingSkyflow from "@/shared/payment/components/payment-processing-skyflow.vue";

interface IProps {
  orderId: string;
}

const props = defineProps<IProps>();

const success = ref(false);
const failure = ref(false);
const changeAddressLoading = ref(false);
const changeMethodLoading = ref(false);
const paymentMethodComponent = ref<InstanceType<typeof PaymentProcessingAuthorizeNet> | null>(null);

const { t } = useI18n();
const { loading, order, fetchShortOrder, fetchFullOrder, addOrUpdatePayment } = useUserOrder();
const { openModal, closeModal } = useModal();
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
const paymentMethodType = computed<number | undefined>(() => payment.value?.paymentMethod?.paymentMethodType);
const paymentTypeName = computed<string | undefined>(() => payment.value?.paymentMethod?.typeName);

function tryAgain() {
  location.reload();
}

function showEditAddressModal() {
  openModal({
    component: AddOrUpdateAddressModal,
    props: {
      address: payment.value?.billingAddress,
      async onResult(address: InputOrderAddressType) {
        closeModal();
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

function showChangePaymentMethodModal(): void {
  openModal({
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

watch(success, async (value) => {
  if (value) {
    await fetchShortOrder({ id: props.orderId });
  }
});

watchEffect(async () => {
  if (props.orderId !== order.value?.id) {
    await fetchFullOrder({ id: props.orderId });
  } else if (order.value?.inPayments[0]?.isApproved) {
    // If the order is paid
    router.replace({ name: "OrderDetails", params: { orderId: props.orderId } });
  }
});
</script>
