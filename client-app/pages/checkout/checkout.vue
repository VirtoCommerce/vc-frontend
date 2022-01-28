<template>
  <template v-if="!showThankYou">
    <!-- Empty cart view -->
    <EmptyCart v-if="cart.items && cart.items?.length === 0 && !showThankYou"></EmptyCart>
    <div v-else class="bg-gray-100 pt-7 pb-16 shadow-inner">
      <div class="max-w-screen-2xl md:px-12 mx-auto">
        <h2 class="text-gray-800 px-5 md:px-0 text-2xl lg:text-3xl font-bold uppercase mb-7">Checkout</h2>
        <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
          <!-- Main section -->
          <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
            <!-- My products section -->
            <CheckoutSection
              title="My products"
              icon-url="/static/images/checkout/products.svg"
              class="shadow lg:pb-11"
            >
              <div class="lg:ml-28 lg:mr-11 lg:border lg:rounded">
                <!-- Product card -->
                <ProductCard
                  v-for="item in cartItems"
                  :key="item?.id"
                  :ref="setProductCardRef"
                  :line-item="item!"
                  @update:quantity="updateItemQuantity"
                  @remove:item="removeCartItem"
                ></ProductCard>

                <div class="py-8 lg:flex lg:items-center lg:px-5">
                  <Pagination
                    v-if="pages > 1"
                    v-model:page="page"
                    :pages="pages"
                    class="mb-3 lg:mb-0"
                    @update:page="page = $event"
                  ></Pagination>
                  <p class="text-center text-sm lg:ml-auto">
                    If you changed multiple quantities,
                    <span class="text-cyan-700 font-extrabold cursor-pointer" @click="updateAllItems">Update All</span>
                  </p>
                </div>
              </div>
            </CheckoutSection>

            <!-- Shipping details section -->
            <CheckoutSection
              title="Shipping details"
              icon-url="/static/images/checkout/shipping.svg"
              class="shadow-inner pb-8 lg:shadow"
            >
              <div class="mx-5 lg:ml-28 lg:mr-11">
                <CheckoutLabeledBlock label="Shipping address">
                  <div>
                    <span class="font-extrabold">Annete Black</span>
                    <p>3891 Ranchview Dr. Richardson, California 62639</p>
                    <p><span class="font-extrabold">Phone:</span> (684) 555-0102</p>
                    <p><span class="font-extrabold">Email:</span> debra.holt@example.com</p>
                  </div>
                  <div>
                    <VcButton size="sm" outline class="px-3 self-start uppercase font-bold" disabled>Change</VcButton>
                  </div>
                </CheckoutLabeledBlock>
                <CheckoutLabeledBlock label="Shipping method">
                  <div class="flex flex-row items-center space-x-4">
                    <template v-if="cart.shipments?.[0]?.shipmentMethodCode">
                      <img src="/assets/static/images/checkout/fedex.svg" class="h-12 w-12" />
                      <span
                        >{{ cart.shipments?.[0].shipmentMethodCode }} {{ cart.shipments?.[0].shipmentMethodOption }} ({{
                          cart.shipments?.[0].price?.formattedAmount
                        }})</span
                      >
                    </template>
                    <div v-else class="text-gray-600">Not defined</div>
                  </div>
                  <div>
                    <VcButton
                      size="sm"
                      outline
                      class="px-3 self-start uppercase font-bold"
                      @click="showShipmentMethodDialog"
                      >Change</VcButton
                    >
                  </div>
                </CheckoutLabeledBlock>
              </div>
            </CheckoutSection>

            <!-- Payment details section -->
            <CheckoutSection
              title="Payment details"
              icon-url="/static/images/checkout/payment.svg"
              class="shadow-inner pb-8 lg:shadow"
            >
              <div class="mx-5 lg:ml-28 lg:mr-11">
                <CheckoutLabeledBlock label="Billing address">
                  <label class="flex items-center text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked="true"
                      disabled
                      class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-yellow-500 checked:border-transparent focus:outline-none cursor-pointer"
                    />
                    <span class="ml-2 font-medium">Same as shipping address</span>
                  </label>
                </CheckoutLabeledBlock>
                <CheckoutLabeledBlock label="Payment method">
                  <div class="flex flex-row items-center space-x-4">
                    <template v-if="cart.payments?.[0]?.paymentGatewayCode">
                      <img src="/assets/static/images/checkout/invoice.svg" class="h-12 w-12" />
                      <span>{{ cart.payments?.[0].paymentGatewayCode }}</span>
                    </template>
                    <div v-else class="text-gray-600">Not defined</div>
                  </div>
                  <div>
                    <VcButton
                      size="sm"
                      outline
                      class="px-3 self-start uppercase font-bold"
                      @click="showPaymentMethodDialog"
                      >Change</VcButton
                    >
                  </div>
                </CheckoutLabeledBlock>
              </div>
            </CheckoutSection>

            <!-- Extra section -->
            <CheckoutSection
              title="Extra"
              icon-url="/static/images/checkout/extra.svg"
              class="shadow-inner pb-8 lg:shadow"
            >
              <div class="mx-5 lg:ml-28 lg:mr-11">
                <p class="font-extrabold text-base mb-1">Order comments</p>
                <TextArea v-model="cartComment" class="resize-none" :rows="4" :max-length="1000"></TextArea>
              </div>
            </CheckoutSection>
            <div class="shadow-inner h-1 lg:hidden"></div>
          </div>

          <!-- Sidebar -->
          <div
            class="flex flex-col px-5 mb-7 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4 lg:h-5/6 lg:sticky lg:top-4"
          >
            <!-- Order summary -->
            <OrderSummary :cart="cart">
              <template #header>
                <!-- Promotion code -->
                <PromoCode
                  v-model="cartCoupon"
                  :cart-coupon-applied="cartCouponApplied"
                  :coupon-validation-error="couponValidationError"
                  @click:coupon-used="useCoupon"
                  @click:coupon-removed="removeCoupon"
                ></PromoCode>
              </template>
              <template #footer>
                <p class="mt-8 mb-3 text-xs font-normal text-gray-400">
                  Availability, shipping, tax & promotions are not final until you complete your order.
                </p>
                <VcButton class="uppercase w-full" :disabled="!isValidCheckout" :waiting="loading" @click="createOrder">
                  Place order
                </VcButton>
              </template>
            </OrderSummary>
          </div>
        </div>
      </div>
    </div>
  </template>
  <ThankYou v-else :order="completedOrder"></ThankYou>
</template>

<script setup lang="ts">
import Pagination from "@/shared/catalog/components/pagination.vue";
import {
  CheckoutLabeledBlock,
  CheckoutSection,
  OrderSummary,
  ProductCard,
  PromoCode,
  EmptyCart,
  ThankYou,
  ShippingMethodDialog,
  PaymentMethodDialog,
} from "@/shared/checkout";
import { TextArea, Button as VcButton } from "@/components";
import { useCart, useCheckout } from "@/shared/cart";
import { usePopup } from "@/shared/popup";
import { computed, onBeforeUpdate, onMounted, ref } from "vue";
import _ from "lodash";
import { PaymentMethodType, ShippingMethodType } from "@/core/api/graphql/types";
import { useUserCheckoutDefaults } from "@/shared/account";

const {
  cart,
  pages,
  itemsPerPage,
  loadMyCart,
  changeItemQuantity,
  removeItem,
  validateCartCoupon,
  addCartCoupon,
  removeCartCoupon,
  changeComment,
  updateShipment,
  updatePayment,
  loading,
} = useCart();

const { getUserCheckoutDefaults } = useUserCheckoutDefaults();

const { placeOrder } = useCheckout();
const { openPopup } = usePopup();

//TODO: change 'any' for a normal type
const productCardRefs = ref<any[]>([]);

const cartCoupon = ref("");
const couponValidationError = ref(false);
const cartCouponApplied = ref(false);

const page = ref(1);
const cartItems = computed(() =>
  cart.value.items?.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const cartComment = ref("");

const isValidCheckout = computed(() => !(cart.value.validationErrors && cart.value.validationErrors?.length > 0));

const completedOrder = ref({});
const showThankYou = ref(false);

//TODO: change 'any' for a normal type
const setProductCardRef = (el: any) => {
  if (el) {
    productCardRefs.value.push(el);
  }
};

const updateAllItems = () => {
  _.each(productCardRefs.value, (productCard) => {
    productCard.updateQuantity();
  });
};

const updateItemQuantity = async (id: string, quantity: number) => {
  await changeItemQuantity(id, quantity);
};

const removeCartItem = async (id: string) => {
  await removeItem(id);
};

const useCoupon = async () => {
  const validationResult = await validateCartCoupon(cartCoupon.value);

  if (validationResult) {
    await addCartCoupon(cartCoupon.value).then(() => {
      couponValidationError.value = false;
      cartCouponApplied.value = true;
    });
  } else {
    couponValidationError.value = true;
  }
};

const removeCoupon = async () => {
  await removeCartCoupon(cartCoupon.value).then(() => {
    cartCoupon.value = "";
    cartCouponApplied.value = false;
  });
};

const createOrder = async () => {
  if (cart.value.id) {
    if (cartComment.value) {
      await changeComment(cartComment.value);
    }
    await placeOrder(cart.value.id).then((order) => {
      completedOrder.value = order;
      showThankYou.value = true;
    });
  }
};

onBeforeUpdate(() => {
  productCardRefs.value = [];
});

onMounted(async () => {
  await loadMyCart().then(async () => {
    if (cart.value.coupons && cart.value.coupons.length > 0) {
      cartCoupon.value = cart.value.coupons[0]?.code || "";
      cartCouponApplied.value = true;
    }
    cartComment.value = cart.value.comment || "";

    //#region set checkout defaults
    const checkoutDefaults = getUserCheckoutDefaults();
    if (!cart.value.shipments?.[0]?.id && checkoutDefaults?.shippingMethod) {
      const method = checkoutDefaults?.shippingMethod;
      await updateShipment({
        shipmentMethodCode: method.code,
        shipmentMethodOption: method.optionName,
        id: cart.value.shipments?.[0]?.id,
      });
    }

    if (!cart.value.payments?.[0]?.id && checkoutDefaults?.paymentMethod) {
      const method = checkoutDefaults?.paymentMethod;
      await updatePayment({
        paymentGatewayCode: method.code,
        id: cart.value.payments?.[0]?.id,
      });
    }
    //#endregion set checkout defaults
  });
});

function showShipmentMethodDialog(): void {
  openPopup({
    component: ShippingMethodDialog,
    props: {
      currentMethodCode: cart.value.shipments?.[0]?.shipmentMethodCode,
      currentMethodOption: cart.value.shipments?.[0]?.shipmentMethodOption,
      availableMethods: cart.value.availableShippingMethods,
      async onResult(method: ShippingMethodType) {
        await updateShipment({
          shipmentMethodCode: method.code,
          shipmentMethodOption: method.optionName,
          id: cart.value.shipments?.[0]?.id,
        });
      },
    },
  });
}

function showPaymentMethodDialog(): void {
  openPopup({
    component: PaymentMethodDialog,
    props: {
      currentMethodCode: cart.value.payments?.[0]?.paymentGatewayCode,
      availableMethods: cart.value.availablePaymentMethods,
      onResult(method: PaymentMethodType) {
        updatePayment({
          paymentGatewayCode: method.code,
          id: cart.value.payments?.[0]?.id,
        });
      },
    },
  });
}
</script>

<style scoped></style>
