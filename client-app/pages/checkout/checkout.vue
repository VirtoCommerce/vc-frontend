<template>
  <!-- Empty cart view -->
  <EmptyCart v-if="cart.items && cart.items?.length === 0"></EmptyCart>
  <div v-else class="bg-gray-100 pt-7 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <h2 class="text-gray-800 px-5 md:px-0 text-2xl lg:text-3xl font-bold uppercase mb-7">Checkout</h2>
      <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:gap-6">
        <!-- Main section -->
        <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
          <!-- My products section -->
          <CheckoutSection title="My products" icon-url="/assets/static/images/products.svg" :is-products-block="true">
            <!-- Product card -->
            <ProductCard
              v-for="item in cart.items"
              :key="item.id"
              :line-item="item"
              @update:quantity="updateItemQuantity"
              @remove:item="removeCartItem"
            ></ProductCard>

            <div class="py-8 lg:flex lg:items-center lg:px-5">
              <Pagination :page="1" :pages="3" class="mb-3 lg:mb-0"></Pagination>
              <p class="text-center text-sm lg:ml-auto">
                If you changed multiple quantities, <span class="text-cyan-700 font-extrabold">Update All</span>
              </p>
            </div>
          </CheckoutSection>

          <!-- Shipping details section -->
          <CheckoutSection
            title="Shipping details"
            icon-url="/assets/static/images/shipping.svg"
            :is-products-block="false"
          >
            <CheckoutLabeledBlock label="Shipping address">
              <div>
                <span class="font-extrabold">Annete Black</span>
                <p>3891 Ranchview Dr. Richardson, California 62639</p>
                <p><span class="font-extrabold">Phone:</span> (684) 555-0102</p>
                <p><span class="font-extrabold">Email:</span> debra.holt@example.com</p>
              </div>
              <div>
                <button
                  class="rounded uppercase h-8 px-3 self-start border-2 font-roboto-condensed font-bold text-sm text-yellow-500 border-yellow-500"
                >
                  Change
                </button>
              </div>
            </CheckoutLabeledBlock>
            <CheckoutLabeledBlock label="Shipping method">
              <div class="flex flex-row items-center gap-4">
                <img src="/assets/static/images/fedex.svg" class="h-12 w-12" />
                <span>Fedex - Express (20$)</span>
              </div>
              <div>
                <button
                  class="rounded uppercase h-8 px-3 self-start border-2 font-roboto-condensed font-bold text-sm text-yellow-500 border-yellow-500"
                >
                  Change
                </button>
              </div>
            </CheckoutLabeledBlock>
          </CheckoutSection>

          <!-- Payment details section -->
          <CheckoutSection
            title="Payment details"
            icon-url="/assets/static/images/payment.svg"
            :is-products-block="false"
          >
            <CheckoutLabeledBlock label="Billing address">
              <label class="flex items-center text-sm cursor-pointer">
                <input
                  type="checkbox"
                  class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-yellow-500 checked:border-transparent focus:outline-none cursor-pointer"
                />
                <span class="ml-2 font-medium">Same as shipping address</span>
              </label>
            </CheckoutLabeledBlock>
            <CheckoutLabeledBlock label="Payment method">
              <div class="flex flex-row items-center gap-4">
                <img src="/assets/static/images/invoice.svg" class="h-12 w-12" />
                <span>Invoice</span>
              </div>
              <div>
                <button
                  class="rounded uppercase h-8 px-3 self-start border-2 font-roboto-condensed font-bold text-sm text-yellow-500 border-yellow-500"
                >
                  Change
                </button>
              </div>
            </CheckoutLabeledBlock>
          </CheckoutSection>

          <!-- Extra section -->
          <CheckoutSection title="Extra" icon-url="/assets/static/images/extra.svg" :is-products-block="false">
            <p class="font-extrabold text-base mb-1">Order comments</p>
            <Textarea :resize-class="'resize-none'" :rows="4" :max-length="1000"></Textarea>
          </CheckoutSection>
          <div class="shadow-inner h-1 lg:hidden"></div>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col px-5 mb-7 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4">
          <!-- Order summary -->
          <OrderSummary :cart="cart">
            <template #coupons>
              <!-- Purchase order -->
              <!-- <p class="text-base pb-2 font-extrabold">Purchase order</p>
              <div class="flex gap-3 mb-5">
                <input
                  class="border rounded text-sm leading-8 flex-1 w-full border-gray-300 h-8 px-2 outline-none focus:border-gray-400"
                  type="text"
                  placeholder="Enter purchase order number"
                />
                <button
                  class="rounded uppercase px-2 border-2 font-roboto-condensed font-bold text-sm text-yellow-500 border-yellow-500"
                >
                  <i class="fas fa-check"></i>
                </button>
              </div> -->

              <!-- Promotion code -->
              <p class="text-base pb-2 font-extrabold">Promotion code</p>
              <div class="flex gap-3" :class="[!couponValidationError && 'mb-8']">
                <input
                  v-model="cartCoupon"
                  class="border rounded text-sm leading-8 flex-1 w-full border-gray-300 h-8 px-2 outline-none focus:border-gray-400"
                  type="text"
                  placeholder="Enter your code"
                  :disabled="cartCouponApplied"
                />
                <button
                  v-if="!cartCouponApplied"
                  class="rounded uppercase w-10 border-2 font-roboto-condensed font-bold text-sm"
                  :class="[
                    cartCoupon.length === 0
                      ? 'border-gray-300 bg-gray-50 text-gray-300'
                      : 'border-yellow-500 bg-yellow-500 text-white',
                  ]"
                  :disabled="cartCoupon.length === 0"
                  @click="useCoupon"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button
                  v-if="cartCouponApplied"
                  class="rounded uppercase w-10 border-2 font-roboto-condensed font-bold text-sm text-red-500 border-red-500 hover:text-white hover:bg-red-500"
                  @click="removeCoupon"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <p v-if="couponValidationError" class="text-red-500 text-sm mb-3">
                This code did not match any active coupon. Was it entered correctly?
              </p>
            </template>
            <template #footer>
              <p class="mt-8 mb-3 text-xs font-normal text-gray-400">
                Availability, shipping, tax & promotions are not final until you complete your order.
              </p>
              <button
                class="uppercase bg-yellow-500 text-white py-2 w-full rounded font-roboto-condensed text-base"
                :disabled="!isValidCheckout"
              >
                Place order
              </button>
            </template>
          </OrderSummary>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Pagination from "@/shared/catalog/components/pagination.vue";
import ProductCard from "@/shared/checkout/components/product-card.vue";
import CheckoutSection from "@/shared/checkout/components/checkout-section.vue";
import CheckoutLabeledBlock from "@/shared/checkout/components/checkout-labeled-block.vue";
import OrderSummary from "@/shared/checkout/components/order-summary.vue";
import EmptyCart from "./empty-cart.vue";
import Textarea from "@/components/Textarea.vue";
import { useCart } from "@/shared/cart";
import { computed, onMounted, ref } from "vue";
import useCheckout from "@/shared/cart/composables/useCheckout";

const { cart, loadMyCart, changeItemQuantity, removeItem, validateCartCoupon, addCartCoupon, removeCartCoupon } =
  useCart();

const { shippingMethods, chosenShippingMethod, billingAddress, chosenPaymentMethod, placeOrder } = useCheckout();

const cartCoupon = ref("");
const couponValidationError = ref(false);
const cartCouponApplied = ref(false);

const isValidCheckout = computed(() =>
  cart.value.items?.every((item) => {
    item?.quantity < item?.inStockQuantity;
  })
);

const updateItemQuantity = async (id: string, quantity: number) => {
  await changeItemQuantity(id, quantity);
};

const removeCartItem = async (id: string) => {
  await removeItem(id);
};

const useCoupon = async () => {
  const validationResult = await validateCartCoupon(cartCoupon.value);
  console.log(validationResult.errors);
  console.log(validationResult.succeeded);
  // couponValidationError.value = validationResult.succeeded;
  // console.log(couponValidationError.value);

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
    cartCouponApplied.value = false;
  });
};

onMounted(async () => {
  console.log(cart.value);
  if (!cart?.value) {
    await loadMyCart();
  }
});
</script>

<style scoped></style>
