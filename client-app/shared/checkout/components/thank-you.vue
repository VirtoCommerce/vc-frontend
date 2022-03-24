<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <h2
        class="text-gray-800 px-5 md:px-0 text-2xl lg:text-3xl font-bold uppercase mb-2"
        v-t="'shared.checkout.thank_you.header'"
      ></h2>
      <p class="text-green-700 px-5 md:px-0 font-extrabold mb-5">
        {{ $t("shared.checkout.thank_you.success_order_message", [order.number]) }}
      </p>
      <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
        <!-- Main section -->
        <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
          <!-- My products section -->
          <VcSection
            :title="$t('shared.checkout.thank_you.products_section.title')"
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
                  @update:page="page = $event"
                ></VcPagination>
              </div>
            </div>
          </VcSection>

          <!-- Gifts section -->
          <AcceptedGifts :items="giftItems" />

          <!-- Order comment section -->
          <VcSection
            v-if="order.comment"
            :title="$t('shared.checkout.thank_you.comment_section.title')"
            icon-url="/static/images/checkout/extra.svg"
            class="shadow-inner pb-8 lg:shadow"
          >
            <div class="ml-24 mr-5 lg:ml-28 lg:mr-11">
              <p class="break-words">
                {{ order.comment }}
              </p>
            </div>
          </VcSection>
          <div class="shadow-inner h-1 lg:hidden"></div>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col px-5 mb-7 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4">
          <!-- Order summary -->
          <OrderSummary :cart="order" class="mb-5"></OrderSummary>

          <VcCard :title="$t('shared.checkout.thank_you.shipping_address_card.title')" is-collapsible class="mb-5">
            <div class="flex flex-col text-sm">
              <span class="font-extrabold"
                >{{ order.shipments?.[0]?.deliveryAddress?.firstName }}
                {{ order.shipments?.[0]?.deliveryAddress?.lastName }}</span
              >
              <p>
                {{ order.shipments?.[0]?.deliveryAddress?.countryCode }}
                {{ order.shipments?.[0]?.deliveryAddress?.regionName }}
                {{ order.shipments?.[0]?.deliveryAddress?.city }}
                {{ order.shipments?.[0]?.deliveryAddress?.line1 }}
                {{ order.shipments?.[0]?.deliveryAddress?.postalCode }}
              </p>
              <p>
                <span class="font-extrabold">{{ $t("shared.checkout.thank_you.phone_label") }}</span>
                {{ order.shipments?.[0]?.deliveryAddress?.phone }}
              </p>
              <p>
                <span class="font-extrabold">{{ $t("shared.checkout.thank_you.email_label") }}</span>
                {{ order.shipments?.[0]?.deliveryAddress?.email }}
              </p>
            </div>
          </VcCard>

          <VcCard :title="$t('shared.checkout.thank_you.shipping_method_card.title')" is-collapsible class="mb-5">
            <div class="flex items-center space-x-4 text-sm">
              <VcImage src="/static/images/checkout/fedex.svg" class="h-12 w-12" />
              <span
                >{{ order.shipments?.[0]?.shipmentMethodCode }} {{ order.shipments?.[0]?.shipmentMethodOption }} ({{
                  order.shipments?.[0]?.price?.formattedAmount
                }})</span
              >
            </div>
          </VcCard>

          <VcCard :title="$t('shared.checkout.thank_you.payment_method_card.title')" is-collapsible class="mb-5">
            <div class="flex items-center space-x-4 text-sm">
              <VcImage src="/static/images/checkout/invoice.svg" class="h-12 w-12" />
              <span>{{ order.inPayments?.[0]?.gatewayCode }}</span>
            </div>
          </VcCard>

          <VcCard :title="$t('shared.checkout.thank_you.billing_address_card.title')" is-collapsible class="mb-5">
            <div class="flex flex-col text-sm">
              <span class="font-extrabold"
                >{{ order.inPayments?.[0]?.billingAddress?.firstName }}
                {{ order.inPayments?.[0]?.billingAddress?.lastName }}</span
              >
              <p>
                {{ order.inPayments?.[0]?.billingAddress?.countryCode }}
                {{ order.inPayments?.[0]?.billingAddress?.regionName }}
                {{ order.inPayments?.[0]?.billingAddress?.city }}
                {{ order.inPayments?.[0]?.billingAddress?.line1 }}
                {{ order.inPayments?.[0]?.billingAddress?.postalCode }}
              </p>
              <p>
                <span class="font-extrabold">{{ $t("shared.checkout.thank_you.phone_label") }}</span>
                {{ order.inPayments?.[0]?.billingAddress?.phone }}
              </p>
              <p>
                <span class="font-extrabold">{{ $t("shared.checkout.thank_you.email_label") }}</span>
                {{ order.inPayments?.[0]?.billingAddress?.email }}
              </p>
            </div>
          </VcCard>

          <VcButton
            class="uppercase w-full"
            @click="printOrder"
            v-t="'shared.checkout.thank_you.print_order'"
          ></VcButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OrderSummary, ProductCard, AcceptedGifts } from "@/shared/checkout";
import { CustomerOrderType } from "@/core/api/graphql/types";
import { useCart } from "@/shared/cart";
import { computed, PropType, ref } from "vue";
import { VcCard, VcImage, VcPagination, VcButton, VcSection } from "@/components";

const { itemsPerPage } = useCart();

const props = defineProps({
  order: {
    type: Object as PropType<CustomerOrderType | Record<string, never>>,
    required: true,
  },
});

const page = ref(1);
const pages = computed(() => Math.ceil(props.order.items.length / itemsPerPage.value));
const orderItems = computed(() =>
  props.order.items
    ?.filter((item) => !item.isGift)
    ?.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const giftItems = computed(() => props.order.items?.filter((item) => item.isGift));

const printOrder = () => {
  window.print();
};
</script>
