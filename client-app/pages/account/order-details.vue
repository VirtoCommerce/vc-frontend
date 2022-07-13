<template>
  <div v-if="order">
    <BackButtonInHeader v-if="isMobile && !isNew" @click="$router.back()" />

    <VcBreadcrumbs v-if="!isMobile" :items="breadcrumbs" class="mx-5 md:mx-0" />

    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0 -mb-3">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{
          isNew
            ? $t("pages.account.order_details.created_title")
            : $t("pages.account.order_details.title", [order?.number])
        }}
      </h2>
    </div>

    <div class="md:flex mx-5 md:mx-0 gap-x-4">
      <div class="text-sm">
        <span class="font-bold">
          {{ $t("pages.account.order_details.status_label") }}
        </span>

        {{ order?.status }}
      </div>

      <div class="text-sm truncate" v-if="order?.purchaseOrderNumber">
        <span class="font-bold">
          {{ $t("pages.account.order_details.purchase_order_label") }}
        </span>
        {{ order?.purchaseOrderNumber }}
      </div>

      <div class="text-sm">
        <span class="font-bold">
          {{ $t("pages.account.order_details.placed_on_label") }}
        </span>
        {{ $d(order?.createdDate, "long") }}
      </div>
    </div>

    <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
      <!-- Main section -->
      <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
        <!-- My products section -->
        <VcSection
          :title="$t('pages.account.order_details.products_section.title')"
          icon-url="/static/images/checkout/products.svg"
          class="shadow lg:pb-11"
        >
          <div class="lg:ml-28 lg:mr-11 lg:border lg:rounded">
            <!-- Product card -->
            <ProductCard v-for="item in orderItems" :key="item?.id" :line-item="item" :read-only="true"></ProductCard>

            <div v-if="pages > 1" class="py-8 lg:flex lg:items-center lg:px-5">
              <VcPagination
                v-model:page="page"
                :pages="pages"
                class="mb-3 lg:mb-0"
                @update:page="onUpdatePage()"
              ></VcPagination>
            </div>
          </div>
        </VcSection>

        <!-- Gifts section -->
        <AcceptedGifts :items="giftItems" />

        <!-- Order comment section -->
        <VcSection
          v-if="order?.comment"
          :title="$t('pages.account.order_details.order_comment_section.title')"
          icon-url="/static/images/checkout/extra.svg"
          class="shadow-inner pb-8 lg:shadow"
        >
          <div class="ml-24 mr-5 lg:ml-28 lg:mr-11">
            <p class="break-words" v-for="line in order?.comment?.split('\n')" :key="line">{{ line }}</p>
          </div>
        </VcSection>

        <div class="shadow-inner h-1 lg:hidden"></div>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col px-5 mb-7 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4">
        <VcButton
          v-if="showPaymentButton"
          class="uppercase w-full mb-5"
          @click="$router.push({ name: 'OrderPayment', params: { orderId } })"
        >
          {{ $t("pages.account.order_details.pay_now_button") }}
        </VcButton>

        <!-- Order summary -->
        <OrderSummary v-if="order" :cart="order" class="mb-5" />

        <VcButton v-if="!isNew" class="uppercase w-full mb-5" @click="openReorderPopup">
          {{ $t("pages.account.order_details.reorder_all_button") }}
        </VcButton>

        <VcCard :title="$t('pages.account.order_details.shipping_address_card.title')" class="mb-5" is-collapsible>
          <div class="flex flex-col space-y-1.5 text-sm">
            <span class="font-extrabold">{{ deliveryAddress?.firstName }} {{ deliveryAddress?.lastName }}</span>
            <p>
              {{ deliveryAddress?.countryCode }}
              {{ deliveryAddress?.regionName }}
              {{ deliveryAddress?.city }}
              {{ deliveryAddress?.line1 }}
              {{ deliveryAddress?.postalCode }}
            </p>
            <p v-if="deliveryAddress?.phone">
              <span class="font-extrabold" v-t="'pages.account.order_details.shipping_address_card.phone_label'" />
              {{ deliveryAddress?.phone }}
            </p>
            <p v-if="deliveryAddress?.email">
              <span class="font-extrabold" v-t="'pages.account.order_details.shipping_address_card.email_label'" />
              {{ deliveryAddress?.email }}
            </p>
          </div>
        </VcCard>

        <VcCard :title="$t('pages.account.order_details.shipping_method_card.title')" class="mb-5" is-collapsible>
          <div class="flex items-center space-x-4 text-sm">
            <VcImage src="/static/images/checkout/fedex.svg" class="h-12 w-12" lazy />

            <span>
              {{ order?.shipments?.[0]?.shipmentMethodCode }} {{ order?.shipments?.[0]?.shipmentMethodOption }} ({{
                order?.shipments?.[0]?.price?.formattedAmount
              }})
            </span>
          </div>
        </VcCard>

        <VcCard :title="$t('pages.account.order_details.payment_details_card.title')" class="mb-5" is-collapsible>
          <div class="flex flex-col space-y-1.5 text-sm">
            <p>
              <span class="font-extrabold">{{
                $t("pages.account.order_details.payment_details_card.payment_number_label")
              }}</span>
              {{ order?.inPayments?.[0]?.number }}
            </p>

            <p class="overflow-x-hidden break-words">
              <span class="font-extrabold">{{
                $t("pages.account.order_details.payment_details_card.payment_type_label")
              }}</span>
              {{ order?.inPayments?.[0]?.gatewayCode }}
            </p>
          </div>

          <div class="mt-3">
            <VcButton class="px-2 py-1 uppercase !text-xs !h-auto" is-outline is-disabled>
              {{ $t("pages.account.order_details.payment_details_card.view_invoice_button") }}
            </VcButton>
          </div>
        </VcCard>

        <VcCard :title="$t('pages.account.order_details.billing_address_card.title')" class="mb-5" is-collapsible>
          <div class="flex flex-col space-y-1.5 text-sm">
            <span class="font-extrabold">{{ billingAddress?.firstName }} {{ billingAddress?.lastName }}</span>
            <p>
              {{ billingAddress?.countryCode }}
              {{ billingAddress?.regionName }}
              {{ billingAddress?.city }}
              {{ billingAddress?.line1 }}
              {{ billingAddress?.postalCode }}
            </p>

            <p v-if="billingAddress?.phone">
              <span class="font-extrabold">
                {{ $t("pages.account.order_details.billing_address_card.phone_label") }}
              </span>
              {{ billingAddress?.phone }}
            </p>

            <p v-if="billingAddress?.email">
              <span class="font-extrabold">
                {{ $t("pages.account.order_details.billing_address_card.email_label") }}
              </span>
              {{ billingAddress?.email }}
            </p>
          </div>
        </VcCard>

        <div class="flex justify-center">
          <VcButton kind="secondary" class="!hidden lg:!inline-flex uppercase px-3" is-outline @click="printOrder">
            <i class="fas fa-print mr-2" />
            {{ $t("shared.checkout.thank_you.print_order") }}
          </VcButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OrderSummary, ProductCard, AcceptedGifts } from "@/shared/checkout";
import { computed, PropType, ref, watchEffect } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { BackButtonInHeader } from "@/shared/layout";
import { ReorderInfo, useUserOrder } from "@/shared/account";
import _ from "lodash";
import { usePopup } from "@/shared/popup";
import { useProducts } from "@/shared/catalog";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";

const props = defineProps({
  orderId: {
    type: String,
    default: "",
  },

  new: {
    type: String as PropType<"true">, // Specifics of router.push params (pass as string "true")
    default: "",
  },
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const { itemsPerPage, pages, order, deliveryAddress, billingAddress, loadOrder, clearOrder } = useUserOrder();
const { fetchProducts, products } = useProducts();
const { openPopup } = usePopup();
const { t } = useI18n();

usePageHead({
  title: computed(() => t("pages.account.order_details.meta.title", [order.value?.number])),
});

const isMobile = breakpoints.smaller("lg");
const page = ref(1);

const isNew = computed<boolean>(() => props.new === "true");

const showPaymentButton = computed<boolean>(() => !!order.value && !order.value.inPayments[0]?.isApproved);

const giftItems = computed(() => order.value?.items?.filter((item) => item.isGift));

const orderItems = computed(() =>
  order.value?.items
    ?.filter((item) => !item.isGift)
    ?.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.orders"), route: { name: "Orders" } },
  { title: t("pages.account.order_details.title", [order.value?.number]) },
]);

function printOrder() {
  window.print();
}

async function openReorderPopup() {
  const orderItemsInfo = order.value?.items
    .filter((item) => !item.isGift)
    .map((item) => {
      return _.pick(item, "productId", "quantity", "id", "sku", "name", "imageUrl");
    });

  const productIds = _.map(orderItemsInfo, (item) => {
    return item.productId;
  });

  await fetchProducts({ itemsPerPage: 6, productIds: productIds });

  openPopup({
    component: ReorderInfo,
    props: {
      productItems: products.value,
      orderItemsInfo: orderItemsInfo,
    },
  });
}

watchEffect(() => {
  clearOrder();
  loadOrder({ id: props.orderId });
});

/**
 * Scroll after page change.
 */
function onUpdatePage() {
  window.scroll({ top: 0, behavior: "smooth" });
}
</script>
