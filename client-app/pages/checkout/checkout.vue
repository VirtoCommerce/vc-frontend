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
            <VcSection title="My products" icon-url="/static/images/checkout/products.svg" class="shadow lg:pb-11">
              <div class="xl:ml-28 lg:ml-6 xl:mr-11 lg:mr-6 lg:border lg:rounded">
                <!-- Product card -->
                <ProductCard
                  v-for="item in cartItems"
                  :key="item?.id"
                  :ref="setProductCardRef"
                  :line-item="item"
                  @update:quantity="updateItemQuantity"
                  @remove:item="removeCartItem"
                  :validation-error="getItemValidationError(item?.id)"
                ></ProductCard>

                <div class="py-8 lg:flex lg:items-center lg:px-5">
                  <VcPagination
                    v-if="pages > 1"
                    v-model:page="page"
                    :pages="pages"
                    class="mb-3 lg:mb-0"
                    @update:page="page = $event"
                  ></VcPagination>
                  <p class="text-center text-sm lg:ml-auto">
                    If you changed multiple quantities,
                    <span class="text-cyan-700 font-extrabold cursor-pointer" @click="updateAllItems">Update All</span>
                  </p>
                </div>
              </div>
            </VcSection>

            <!-- Gifts section -->
            <VcSection
              v-if="cart.availableGifts?.length"
              title="+ Add a Gift"
              icon-url="/static/images/checkout/gifts.svg"
              class="shadow-inner pb-8 lg:shadow"
            >
              <div class="xl:ml-28 lg:ml-6 xl:mr-11 lg:mr-6 lg:border lg:rounded">
                <div
                  v-for="gift in cart.availableGifts"
                  :key="gift.id"
                  class="border-b last:border-b-0 flex items-center justify-between px-7 py-6"
                >
                  <VcCheckbox class="mr-7" :model-value="checkGift(gift)" @change="toggleGift($event, gift)" />
                  <VcImage :src="gift.imageUrl" class="mr-4 border aspect-square w-16 h-16" />
                  <div class="flex-grow font-bold text-cyan-700">{{ gift.name }}</div>
                </div>
              </div>
            </VcSection>

            <!-- Shipping details section -->
            <VcSection
              title="Shipping details"
              icon-url="/static/images/checkout/shipping.svg"
              class="shadow-inner pb-8 lg:shadow"
            >
              <div class="mx-5 xl:ml-28 lg:ml-6 xl:mr-11 lg:mr-6">
                <CheckoutLabeledBlock label="Shipping address">
                  <template v-if="cart.shipments && cart.shipments?.[0]?.deliveryAddress">
                    <div>
                      <span class="font-extrabold">
                        {{ cart.shipments[0].deliveryAddress?.firstName }}
                        {{ cart.shipments[0].deliveryAddress?.lastName }}
                      </span>
                      <p>
                        {{ cart.shipments[0].deliveryAddress?.countryCode }}
                        {{ cart.shipments[0].deliveryAddress?.regionName }}
                        {{ cart.shipments[0].deliveryAddress?.city }} {{ cart.shipments[0].deliveryAddress?.line1 }}
                        {{ cart.shipments[0].deliveryAddress?.postalCode }}
                      </p>
                      <p><span class="font-extrabold">Phone:</span> {{ cart.shipments[0].deliveryAddress?.phone }}</p>
                      <p><span class="font-extrabold">Email:</span> {{ cart.shipments[0].deliveryAddress?.email }}</p>
                    </div>
                    <div>
                      <VcButton
                        size="sm"
                        is-outline
                        class="px-3 self-start uppercase font-bold"
                        @click="selectShippingAddressDialog"
                      >
                        Change
                      </VcButton>
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-red-500 flex items-center space-x-4">
                      <i class="fas fa-exclamation-triangle text-2xl"></i>
                      <span>You do not have a shipping address. Please choose/create a new one.</span>
                    </div>
                    <div>
                      <VcButton
                        size="sm"
                        is-outline
                        class="px-3 self-start uppercase font-bold"
                        @click="selectShippingAddressDialog"
                      >
                        New address
                      </VcButton>
                    </div>
                  </template>
                </CheckoutLabeledBlock>
                <CheckoutLabeledBlock label="Shipping method">
                  <div class="flex flex-row items-center space-x-4">
                    <template v-if="cart.shipments?.[0]?.shipmentMethodCode">
                      <VcImage src="/static/images/checkout/fedex.svg" class="h-12 w-12" />
                      <span
                        >{{ cart.shipments?.[0].shipmentMethodCode }}
                        {{ cart.shipments?.[0].shipmentMethodOption }} (<VcPriceDisplay
                          :value="cart.shipments?.[0].price"
                        />)</span
                      >
                    </template>
                    <div v-else class="text-gray-600">Not defined</div>
                  </div>
                  <div>
                    <VcButton
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="showShipmentMethodDialog"
                    >
                      Change
                    </VcButton>
                  </div>
                </CheckoutLabeledBlock>
              </div>
            </VcSection>

            <!-- Payment details section -->
            <VcSection
              title="Payment details"
              icon-url="/static/images/checkout/payment.svg"
              class="shadow-inner pb-8 lg:shadow"
            >
              <div class="mx-5 xl:ml-28 lg:ml-6 xl:mr-11 lg:mr-6">
                <CheckoutLabeledBlock label="Billing address">
                  <label class="flex items-center text-sm cursor-pointer">
                    <input
                      v-model="billingSameAsShipping"
                      type="checkbox"
                      class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-yellow-500 checked:border-transparent focus:outline-none cursor-pointer"
                    />
                    <span class="ml-2 font-medium">Same as shipping address</span>
                  </label>
                </CheckoutLabeledBlock>
                <div
                  v-if="!billingSameAsShipping && !cart.payments?.[0]?.billingAddress"
                  class="border-b border-r border-l rounded-l-none rounded-r-none rounded -mt-6 mb-6 p-5 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between"
                >
                  <div class="text-red-500 flex items-center space-x-4">
                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                    <span class="text-sm">You do not have a billing address. Please choose/create a new one.</span>
                  </div>
                  <div>
                    <VcButton
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="selectBillingAddressDialog"
                    >
                      New address
                    </VcButton>
                  </div>
                </div>
                <div
                  v-else-if="!billingSameAsShipping && cart.payments?.[0]?.billingAddress"
                  class="border-b border-r border-l rounded-l-none rounded-r-none rounded -mt-6 mb-6 p-5 flex justify-between items-center text-sm"
                >
                  <div>
                    <span class="font-extrabold"
                      >{{ cart.payments[0].billingAddress?.firstName }}
                      {{ cart.payments[0].billingAddress?.lastName }}</span
                    >
                    <p>
                      {{ cart.payments[0].billingAddress?.countryCode }}
                      {{ cart.payments[0].billingAddress?.regionName }}
                      {{ cart.payments[0].billingAddress?.city }} {{ cart.payments[0].billingAddress?.line1 }}
                      {{ cart.payments[0].billingAddress?.postalCode }}
                    </p>
                    <p><span class="font-extrabold">Phone:</span>{{ cart.payments[0].billingAddress?.phone }}</p>
                    <p><span class="font-extrabold">Email:</span>{{ cart.payments[0].billingAddress?.email }}</p>
                  </div>
                  <div>
                    <VcButton
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="selectBillingAddressDialog"
                    >
                      Change
                    </VcButton>
                  </div>
                </div>
                <CheckoutLabeledBlock label="Payment method">
                  <div class="flex flex-row items-center space-x-4">
                    <template v-if="cart.payments?.[0]?.paymentGatewayCode">
                      <VcImage src="/static/images/checkout/invoice.svg" class="h-12 w-12" />
                      <span>{{ cart.payments?.[0].paymentGatewayCode }}</span>
                    </template>
                    <div v-else class="text-gray-600">Not defined</div>
                  </div>
                  <div>
                    <VcButton
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="showPaymentMethodDialog"
                    >
                      Change
                    </VcButton>
                  </div>
                </CheckoutLabeledBlock>
              </div>
            </VcSection>

            <!-- Extra section -->
            <VcSection title="Extra" icon-url="/static/images/checkout/extra.svg" class="shadow-inner pb-8 lg:shadow">
              <div class="mx-5 xl:ml-28 lg:ml-6 xl:mr-11 lg:mr-6">
                <p class="font-extrabold text-base mb-1">Order comments</p>
                <VcTextArea v-model="cartComment" class="resize-none" :rows="4" :max-length="1000" />
              </div>
            </VcSection>
            <div class="shadow-inner h-1 lg:hidden"></div>
          </div>

          <!-- Sidebar -->
          <div
            class="flex flex-col px-5 mb-7 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4 lg:h-5/6 lg:sticky lg:top-4"
          >
            <!-- Order summary -->
            <OrderSummary :cart="cart">
              <template #header>
                <!-- Purchase order -->
                <VcActionInput
                  v-model="purchaseOrderNumber"
                  class="mb-5"
                  label="Purchase order"
                  placeholder="Enter purchase order number"
                  :is-applied="purchaseOrderNumberApplied"
                  :is-disabled="loading"
                  :max-length="128"
                  @click:apply="setPurchaseOrderNumber"
                  @click:deny="removePurchaseOrderNumber"
                  @update:model-value="couponValidationError = ''"
                ></VcActionInput>

                <!-- Promotion code -->
                <VcActionInput
                  v-model="cartCoupon"
                  :class="[couponValidationError ? 'mb-0' : 'mb-8']"
                  label="Promotion code"
                  placeholder="Enter your code"
                  :is-applied="cartCouponApplied"
                  :error-message="couponValidationError"
                  :is-disabled="loading"
                  @click:apply="useCoupon"
                  @click:deny="removeCoupon"
                  @update:model-value="couponValidationError = ''"
                ></VcActionInput>
              </template>
              <template #footer>
                <p class="mt-8 mb-3 text-xs font-normal text-gray-400">
                  Availability, shipping, tax & promotions are not final until you complete your order.
                </p>
                <VcButton
                  class="uppercase w-full"
                  :is-disabled="!isValidCheckout"
                  :is-waiting="loading"
                  @click="createOrder"
                >
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
import {
  CheckoutLabeledBlock,
  OrderSummary,
  ProductCard,
  EmptyCart,
  ThankYou,
  ShippingMethodDialog,
  PaymentMethodDialog,
  ShippingAddressDialog,
  CreateAddressDialog,
} from "@/shared/checkout";
import {
  VcTextArea,
  VcImage,
  VcPriceDisplay,
  VcPagination,
  VcButton,
  VcActionInput,
  VcSection,
  VcCheckbox,
} from "@/components";
import { useCart, useCheckout } from "@/shared/cart";
import { usePopup } from "@/shared/popup";
import { computed, onBeforeUpdate, onMounted, ref } from "vue";
import _ from "lodash";
import {
  GiftItemType,
  InputAddressType,
  MemberAddressType,
  PaymentMethodType,
  ShippingMethodType,
  ValidationErrorType,
} from "@/core/api/graphql/types";
import { useUser, useUserAddresses } from "@/shared/account";
import { AddressType } from "@/core/types";
import { addGiftItems, rejectGiftItems } from "@core/api/graphql/cart";

const { me: user } = useUser();
const {
  loading,
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
  updatePurchaseOrderNumber,
} = useCart();

const { addOrUpdateAddresses } = useUserAddresses({ user });

const { placeOrder } = useCheckout();
const { openPopup, closePopup } = usePopup();

//TODO: change 'any' for a normal type
const productCardRefs = ref<any[]>([]);

const cartCoupon = ref("");
const couponValidationError = ref("");
const cartCouponApplied = ref(false);

const purchaseOrderNumber = ref("");
const purchaseOrderNumberApplied = computed(() => !!cart.value.purchaseOrderNumber);

const billingSameAsShipping = ref(true);

const page = ref(1);
const cartItems = computed(() =>
  cart.value.items?.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const cartComment = ref("");

const isValidCheckout = computed(
  () =>
    !(cart.value.validationErrors && cart.value.validationErrors?.length > 0) &&
    isValidShipment.value &&
    isValidPayment.value
);

const isValidShipment = computed(
  () =>
    cart.value.shipments?.[0] &&
    cart.value.shipments?.[0]?.shipmentMethodCode &&
    cart.value.shipments?.[0]?.deliveryAddress
);

const isValidPayment = computed(() => cart.value.payments?.[0] && cart.value.payments?.[0]?.paymentGatewayCode);

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
      couponValidationError.value = "";
      cartCouponApplied.value = true;
    });
  } else {
    couponValidationError.value = "This code did not match any active coupon. Was it entered correctly?";
  }
};

const removeCoupon = async () => {
  await removeCartCoupon(cartCoupon.value).then(() => {
    cartCoupon.value = "";
    cartCouponApplied.value = false;
  });
};

const setPurchaseOrderNumber = async () => {
  await updatePurchaseOrderNumber(purchaseOrderNumber.value);
};

const removePurchaseOrderNumber = async () => {
  purchaseOrderNumber.value = "";
  await updatePurchaseOrderNumber("");
};

const createOrder = async () => {
  if (cart.value.id) {
    if (cartComment.value) {
      await changeComment(cartComment.value);
    }

    if (billingSameAsShipping.value) {
      await updatePayment({
        id: cart.value.payments?.[0]?.id,
        billingAddress: { ...cart.value.shipments?.[0]?.deliveryAddress },
      });
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
  await loadMyCart().then(() => {
    if (cart.value.coupons && cart.value.coupons.length > 0) {
      cartCoupon.value = cart.value.coupons[0]?.code || "";
      cartCouponApplied.value = true;
    }
    cartComment.value = cart.value.comment || "";

    purchaseOrderNumber.value = cart.value.purchaseOrderNumber || "";
  });
});

function getItemValidationError(lineItemId: string): ValidationErrorType | undefined {
  return _.find(cart.value.validationErrors, (error) => error.objectId === lineItemId);
}

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
      async onResult(method: PaymentMethodType) {
        await updatePayment({
          paymentGatewayCode: method.code,
          id: cart.value.payments?.[0]?.id,
        });
      },
    },
  });
}

function selectShippingAddressDialog(): void {
  openPopup({
    component: ShippingAddressDialog,
    props: {
      currentAddress: cart.value.shipments?.[0]?.deliveryAddress,
      async onResult(address: InputAddressType) {
        const convertedAddress = _.omit(address, ["isDefault"]);
        await updateShipment({
          id: cart.value.shipments?.[0]?.id,
          deliveryAddress: { ...convertedAddress },
        });
      },
      onAddNewAddress() {
        setTimeout(() => {
          addNewAddressDialog(AddressType.Shipping);
        }, 500);
      },
    },
  });
}

function selectBillingAddressDialog(): void {
  openPopup({
    component: ShippingAddressDialog,
    props: {
      currentAddress: cart.value.payments?.[0]?.billingAddress,
      async onResult(address: InputAddressType) {
        const convertedAddress = _.omit(address, ["isDefault"]);
        await updatePayment({
          id: cart.value.payments?.[0]?.id,
          billingAddress: { ...convertedAddress },
        });
      },
      onAddNewAddress() {
        setTimeout(() => {
          addNewAddressDialog(AddressType.Billing);
        }, 500);
      },
    },
  });
}

function addNewAddressDialog(addressType: AddressType.Billing | AddressType.Shipping): void {
  openPopup({
    component: CreateAddressDialog,
    props: {
      async onResult(address: MemberAddressType) {
        closePopup();
        const newAddress = { ...address, addressType: AddressType.BillingAndShipping };
        await addOrUpdateAddresses([newAddress]);
        const convertedAddress = _.omit(newAddress, ["isDefault"]);

        if (addressType.valueOf() === AddressType.Billing) {
          updatePayment({
            id: cart.value.payments?.[0]?.id,
            billingAddress: { ...convertedAddress },
          });
        } else {
          updateShipment({
            id: cart.value.shipments?.[0]?.id,
            deliveryAddress: { ...convertedAddress },
          });
        }
      },
    },
  });
}

function checkGift(gift: GiftItemType): boolean {
  return !!cart.value.gifts?.find((giftData) => giftData.lineItemId === gift.lineItemId);
}

async function toggleGift(state: boolean | any[], gift: GiftItemType) {
  if (state) {
    await addGiftItems([gift.id]);
  } else {
    if (gift.lineItemId) {
      await rejectGiftItems([gift.lineItemId]);
    }
  }
  await loadMyCart();
}
</script>

<style scoped></style>
