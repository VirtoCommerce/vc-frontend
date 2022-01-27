<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <h2 class="text-gray-800 px-5 md:px-0 text-2xl lg:text-3xl font-bold uppercase mb-2">Order complete</h2>
      <p class="text-green-700 px-5 md:px-0 font-extrabold mb-5">
        Order {{ order.number }} has be successfully submitted. You will be notified via email when your order is ready
        for shipping
      </p>
      <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
        <!-- Main section -->
        <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
          <!-- My products section -->
          <CheckoutSection
            title="My purchased products"
            icon-url="/static/images/checkout/products.svg"
            class="shadow lg:pb-11"
          >
            <div class="lg:ml-28 lg:mr-11 lg:border lg:rounded">
              <!-- Product card -->
              <ProductCard
                v-for="item in orderItems"
                :key="item?.id"
                :line-item="item!"
                :read-only="true"
              ></ProductCard>

              <div v-if="pages > 1" class="py-8 lg:flex lg:items-center lg:px-5">
                <Pagination
                  v-model:page="page"
                  :pages="pages"
                  class="mb-3 lg:mb-0"
                  @update:page="page = $event"
                ></Pagination>
              </div>
            </div>
          </CheckoutSection>

          <!-- Order comment section -->
          <CheckoutSection
            v-if="order.comment"
            title="Order comment"
            icon-url="/static/images/checkout/extra.svg"
            class="shadow-inner pb-8 lg:shadow"
          >
            <div class="ml-24 mr-5 lg:ml-28 lg:mr-11">
              <p class="break-words">
                {{ order.comment }}
              </p>
            </div>
          </CheckoutSection>
          <div class="shadow-inner h-1 lg:hidden"></div>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col px-5 mb-7 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4">
          <!-- Order summary -->
          <OrderSummary :cart="order" class="mb-5"></OrderSummary>
          <Card title="Billing address" :is-collapsible="true" class="mb-5">
            <div class="flex flex-col text-sm">
              <span class="font-extrabold">Annete Black</span>
              <p>3891 Ranchview Dr. Richardson, California 62639</p>
              <p><span class="font-extrabold">Phone:</span> (684) 555-0102</p>
              <p><span class="font-extrabold">Email:</span> debra.holt@example.com</p>
            </div>
          </Card>
          <Card title="Shipping method" :is-collapsible="true" class="mb-5">
            <div class="flex items-center space-x-4 text-sm">
              <Image src="/static/images/checkout/fedex.svg" class="h-12 w-12" />
              <span>Fedex - Express (20$)</span>
            </div>
          </Card>
          <Card title="Shipping address" :is-collapsible="true" class="mb-5">
            <div class="flex flex-col text-sm">
              <span class="font-extrabold">Annete Black</span>
              <p>3891 Ranchview Dr. Richardson, California 62639</p>
              <p><span class="font-extrabold">Phone:</span> (684) 555-0102</p>
              <p><span class="font-extrabold">Email:</span> debra.holt@example.com</p>
            </div>
          </Card>
          <Card title="Payment method" :is-collapsible="true" class="mb-5">
            <div class="flex items-center space-x-4 text-sm">
              <Image src="/static/images/checkout/invoice.svg" class="h-12 w-12" />
              <span>Invoice</span>
            </div>
          </Card>
          <button
            class="uppercase bg-yellow-500 text-white py-2 w-full rounded font-roboto-condensed text-base disabled:opacity-30"
            @click="printOrder"
          >
            Print order
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckoutSection, OrderSummary, ProductCard } from "@/shared/checkout";
import { CustomerOrderType } from "@/core/api/graphql/types";
import Pagination from "@/shared/catalog/components/pagination.vue";
import { useCart } from "@/shared/cart";
import { computed, PropType, ref } from "vue";
import { Card, Image } from "@/components";

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
  props.order.items?.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const printOrder = () => {
  window.print();
};
</script>
