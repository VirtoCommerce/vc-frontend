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
          <CheckoutSection
            title="My products"
            icon-url="/assets/static/images/checkout/products.svg"
            :is-products-block="true"
          >
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
          </CheckoutSection>

          <!-- Shipping details section -->
          <CheckoutSection
            title="Shipping details"
            icon-url="/assets/static/images/checkout/shipping.svg"
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
                  class="rounded uppercase h-8 px-3 self-start border-2 font-roboto-condensed font-bold text-sm text-yellow-500 border-yellow-500 disabled:opacity-30"
                  disabled
                >
                  Change
                </button>
              </div>
            </CheckoutLabeledBlock>
            <CheckoutLabeledBlock label="Shipping method">
              <div class="flex flex-row items-center gap-4">
                <img src="/assets/static/images/checkout/fedex.svg" class="h-12 w-12" />
                <span>Fedex - Express (20$)</span>
              </div>
              <div>
                <button
                  class="rounded uppercase h-8 px-3 self-start border-2 font-roboto-condensed font-bold text-sm text-yellow-500 border-yellow-500 disabled:opacity-30"
                  disabled
                >
                  Change
                </button>
              </div>
            </CheckoutLabeledBlock>
          </CheckoutSection>

          <!-- Payment details section -->
          <CheckoutSection
            title="Payment details"
            icon-url="/assets/static/images/checkout/payment.svg"
            :is-products-block="false"
          >
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
              <div class="flex flex-row items-center gap-4">
                <img src="/assets/static/images/checkout/invoice.svg" class="h-12 w-12" />
                <span>Invoice</span>
              </div>
              <div>
                <button
                  class="rounded uppercase h-8 px-3 self-start border-2 font-roboto-condensed font-bold text-sm text-yellow-500 border-yellow-500 disabled:opacity-30"
                  disabled
                >
                  Change
                </button>
              </div>
            </CheckoutLabeledBlock>
          </CheckoutSection>

          <!-- Extra section -->
          <CheckoutSection title="Extra" icon-url="/assets/static/images/checkout/extra.svg" :is-products-block="false">
            <p class="font-extrabold text-base mb-1">Order comments</p>
            <Textarea v-model="cartComment" :resize-class="'resize-none'" :rows="4" :max-length="1000"></Textarea>
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
              <button
                class="uppercase bg-yellow-500 text-white py-2 w-full rounded font-roboto-condensed text-base disabled:opacity-30"
                :disabled="!isValidCheckout"
                @click="createOrder"
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
import {
  CheckoutLabeledBlock,
  CheckoutSection,
  OrderSummary,
  ProductCard,
  PromoCode,
  EmptyCart,
} from "@/shared/checkout";
import Textarea from "@/components/Textarea.vue";
import { useCart } from "@/shared/cart";
import { computed, onBeforeUpdate, onMounted, ref } from "vue";
import useCheckout from "@/shared/cart/composables/useCheckout";
import { useRouter } from "vue-router";
import _ from "lodash";

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
} = useCart();

const { placeOrder } = useCheckout();

const router = useRouter();

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
    await placeOrder(cart.value.id).then(() => {
      router.push({ name: "OrderComplete" });
    });
  }
};

onBeforeUpdate(() => {
  productCardRefs.value = [];
});

onMounted(async () => {
  await loadMyCart().then(() => {
    if (cart.value.coupons && cart.value.coupons.length > 0) {
      cartCoupon.value = cart.value.coupons[0]?.code || "";
      cartCouponApplied.value = true;
    }
    cartComment.value = cart.value.comment || "";
  });
});
</script>

<style scoped></style>
