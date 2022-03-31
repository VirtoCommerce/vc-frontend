<template>
  <template v-if="!showThankYou">
    <!-- Empty cart view -->
    <EmptyCart v-if="cart.items && cart.items?.length === 0 && !showThankYou"></EmptyCart>
    <div v-else class="bg-gray-100 pt-7 pb-16 shadow-inner">
      <div class="max-w-screen-2xl md:px-12 mx-auto">
        <h2
          class="text-gray-800 px-5 md:px-0 text-2xl lg:text-3xl font-bold uppercase mb-7"
          v-t="'pages.checkout.title'"
        ></h2>
        <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
          <!-- Main section -->
          <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
            <!-- My products section -->
            <VcSection
              :title="$t('pages.checkout.products_section.title')"
              icon-url="/static/images/checkout/products.svg"
              class="shadow lg:pb-11"
            >
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
                    {{ $t("pages.checkout.products_section.update_all_link_label") }}
                    <span
                      class="text-[color:var(--color-link)] font-extrabold cursor-pointer"
                      @click="updateAllItems"
                      v-t="'pages.checkout.products_section.update_all_link'"
                    ></span>
                  </p>
                </div>
              </div>
            </VcSection>

            <!-- Gifts section -->
            <VcSection
              v-if="$cfg.checkout_gifts_enabled && cart.availableGifts?.length"
              :title="$t('pages.checkout.gifts_section.title')"
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
                  <div class="flex-grow font-bold text-[color:var(--color-link)]">{{ gift.name }}</div>
                </div>
              </div>
            </VcSection>

            <!-- Shipping details section -->
            <VcSection
              :title="$t('pages.checkout.shipping_details_section.title')"
              icon-url="/static/images/checkout/shipping.svg"
              class="shadow-inner pb-8 lg:shadow"
            >
              <div class="mx-5 xl:ml-28 lg:ml-6 xl:mr-11 lg:mr-6">
                <CheckoutLabeledBlock
                  :label="$t('pages.checkout.shipping_details_section.shipping_address_block.title')"
                >
                  <template v-if="shipment?.deliveryAddress">
                    <div>
                      <span class="font-extrabold">
                        {{ shipment.deliveryAddress?.firstName }}
                        {{ shipment.deliveryAddress?.lastName }}
                      </span>
                      <p>
                        {{ shipment.deliveryAddress?.countryCode }}
                        {{ shipment.deliveryAddress?.regionName }}
                        {{ shipment.deliveryAddress?.city }} {{ shipment.deliveryAddress?.line1 }}
                        {{ shipment.deliveryAddress?.postalCode }}
                      </p>
                      <p>
                        <span
                          class="font-extrabold"
                          v-t="'pages.checkout.shipping_details_section.shipping_address_block.phone_label'"
                        ></span>
                        {{ shipment.deliveryAddress?.phone }}
                      </p>
                      <p>
                        <span
                          class="font-extrabold"
                          v-t="'pages.checkout.shipping_details_section.shipping_address_block.email_label'"
                        ></span>
                        {{ shipment.deliveryAddress?.email }}
                      </p>
                    </div>
                    <div>
                      <VcButton
                        size="sm"
                        is-outline
                        class="px-3 self-start uppercase font-bold"
                        @click="
                          isAuthenticated
                            ? selectShippingAddressDialog()
                            : addOrUpdateAddressDialog(AddressType.Shipping, shipment?.deliveryAddress)
                        "
                        v-t="'pages.checkout.shipping_details_section.shipping_address_block.change_button'"
                      >
                      </VcButton>
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-[color:var(--color-danger)] flex items-center space-x-4">
                      <i class="fas fa-exclamation-triangle text-2xl"></i>
                      <span
                        v-if="isAuthenticated"
                        v-t="'pages.checkout.shipping_details_section.shipping_address_block.no_addresses_message'"
                      ></span>
                      <span
                        v-else
                        v-t="
                          'pages.checkout.shipping_details_section.shipping_address_block.unauthenticated_no_addresses_message'
                        "
                      ></span>
                    </div>

                    <div>
                      <VcButton
                        size="sm"
                        is-outline
                        class="px-3 self-start uppercase font-bold"
                        @click="
                          isAuthenticated
                            ? selectShippingAddressDialog()
                            : addOrUpdateAddressDialog(AddressType.Shipping)
                        "
                        v-t="'pages.checkout.shipping_details_section.shipping_address_block.add_address_button'"
                      >
                      </VcButton>
                    </div>
                  </template>
                </CheckoutLabeledBlock>
                <CheckoutLabeledBlock
                  :label="$t('pages.checkout.shipping_details_section.shipping_method_block.title')"
                >
                  <div class="flex flex-row items-center space-x-4">
                    <template v-if="shipment?.shipmentMethodCode">
                      <VcImage src="/static/images/checkout/fedex.svg" class="h-12 w-12" />
                      <span>
                        {{ shipment.shipmentMethodCode }} {{ shipment.shipmentMethodOption }} (<VcPriceDisplay
                          :value="shipment.price"
                        />)
                      </span>
                    </template>
                    <div
                      v-else
                      class="text-gray-600"
                      v-t="'pages.checkout.shipping_details_section.shipping_method_block.not_defined_message'"
                    ></div>
                  </div>
                  <div>
                    <VcButton
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="showShipmentMethodDialog"
                      v-t="'pages.checkout.shipping_details_section.shipping_method_block.change_button'"
                    >
                    </VcButton>
                  </div>
                </CheckoutLabeledBlock>
              </div>
            </VcSection>

            <!-- Payment details section -->
            <VcSection
              :title="$t('pages.checkout.payment_details_section.title')"
              icon-url="/static/images/checkout/payment.svg"
              class="shadow-inner pb-8 lg:shadow"
            >
              <div class="mx-5 xl:ml-28 lg:ml-6 xl:mr-11 lg:mr-6">
                <CheckoutLabeledBlock :label="$t('pages.checkout.payment_details_section.billing_address_block.title')">
                  <label class="flex items-center text-sm cursor-pointer">
                    <input
                      v-model="billingSameAsShipping"
                      type="checkbox"
                      class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-[color:var(--color-primary)] checked:border-transparent focus:outline-none cursor-pointer"
                    />
                    <span
                      class="ml-2 font-medium"
                      v-t="
                        'pages.checkout.payment_details_section.billing_address_block.same_as_shipping_checkbox_label'
                      "
                    ></span>
                  </label>
                </CheckoutLabeledBlock>
                <div
                  v-if="!billingSameAsShipping && !payment?.billingAddress"
                  class="border-b border-r border-l rounded-l-none rounded-r-none rounded -mt-6 mb-6 p-5 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between"
                >
                  <div class="text-[color:var(--color-danger)] flex items-center space-x-4">
                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                    <span
                      v-if="isAuthenticated"
                      class="text-sm"
                      v-t="'pages.checkout.payment_details_section.billing_address_block.no_addresses_message'"
                    ></span>

                    <span
                      v-else
                      class="text-sm"
                      v-t="
                        'pages.checkout.payment_details_section.billing_address_block.unauthenticated_no_addresses_message'
                      "
                    ></span>
                  </div>

                  <div>
                    <VcButton
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="
                        isAuthenticated ? selectBillingAddressDialog() : addOrUpdateAddressDialog(AddressType.Billing)
                      "
                      v-t="'pages.checkout.payment_details_section.billing_address_block.add_address_button'"
                    >
                    </VcButton>
                  </div>
                </div>

                <div
                  v-else-if="!billingSameAsShipping && payment?.billingAddress"
                  class="border-b border-r border-l rounded-l-none rounded-r-none rounded -mt-6 mb-6 p-5 flex justify-between items-center text-sm"
                >
                  <div>
                    <span class="font-extrabold">
                      {{ payment.billingAddress?.firstName }}
                      {{ payment.billingAddress?.lastName }}
                    </span>
                    <p>
                      {{ payment.billingAddress?.countryCode }}
                      {{ payment.billingAddress?.regionName }}
                      {{ payment.billingAddress?.city }} {{ payment.billingAddress?.line1 }}
                      {{ payment.billingAddress?.postalCode }}
                    </p>
                    <p>
                      <span
                        class="font-extrabold"
                        v-t="'pages.checkout.payment_details_section.billing_address_block.phone_label'"
                      ></span
                      >{{ payment.billingAddress?.phone }}
                    </p>
                    <p>
                      <span
                        class="font-extrabold"
                        v-t="'pages.checkout.payment_details_section.billing_address_block.email_label'"
                      ></span
                      >{{ payment.billingAddress?.email }}
                    </p>
                  </div>
                  <div>
                    <VcButton
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="
                        isAuthenticated
                          ? selectBillingAddressDialog()
                          : addOrUpdateAddressDialog(AddressType.Billing, payment?.billingAddress)
                      "
                      v-t="'pages.checkout.payment_details_section.billing_address_block.change_button'"
                    >
                    </VcButton>
                  </div>
                </div>
                <CheckoutLabeledBlock :label="$t('pages.checkout.payment_details_section.payment_method_block.title')">
                  <div class="flex flex-row items-center space-x-4">
                    <template v-if="payment?.paymentGatewayCode">
                      <VcImage src="/static/images/checkout/invoice.svg" class="h-12 w-12" />
                      <span>{{ payment.paymentGatewayCode }}</span>
                    </template>
                    <div
                      v-else
                      class="text-gray-600"
                      v-t="'pages.checkout.payment_details_section.payment_method_block.not_defined_message'"
                    ></div>
                  </div>
                  <div>
                    <VcButton
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="showPaymentMethodDialog"
                      v-t="'pages.checkout.payment_details_section.payment_method_block.change_button'"
                    >
                    </VcButton>
                  </div>
                </CheckoutLabeledBlock>
              </div>
            </VcSection>

            <!-- Extra section -->
            <VcSection
              v-if="$cfg.checkout_comment_enabled"
              :title="$t('pages.checkout.extra_section.title')"
              icon-url="/static/images/checkout/extra.svg"
              class="shadow-inner pb-8 lg:shadow"
            >
              <div class="mx-5 xl:ml-28 lg:ml-6 xl:mr-11 lg:mr-6">
                <p class="font-extrabold text-base mb-1" v-t="'pages.checkout.extra_section.comment_label'"></p>
                <VcTextArea v-model="cartComment" class="resize-none" :rows="4" :max-length="1000" counter />
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
                  v-if="$cfg.checkout_purchase_order_enabled"
                  v-model="purchaseOrderNumber"
                  class="mb-5"
                  :label="$t('pages.checkout.order_summary_block.purchase_order_label')"
                  :placeholder="$t('pages.checkout.order_summary_block.purchase_order_placeholder')"
                  :is-applied="purchaseOrderNumberApplied"
                  :is-disabled="loading"
                  :max-length="128"
                  @click:apply="setPurchaseOrderNumber"
                  @click:deny="removePurchaseOrderNumber"
                  @update:model-value="couponValidationError = ''"
                ></VcActionInput>

                <!-- Promotion code -->
                <VcActionInput
                  v-if="$cfg.checkout_coupon_enabled"
                  v-model="cartCoupon"
                  :class="[couponValidationError ? 'mb-0' : 'mb-8']"
                  :label="$t('pages.checkout.order_summary_block.promotion_code_label')"
                  :placeholder="$t('pages.checkout.order_summary_block.promotion_code_placeholder')"
                  :is-applied="cartCouponApplied"
                  :error-message="couponValidationError"
                  :is-disabled="loading"
                  @click:apply="useCoupon"
                  @click:deny="removeCoupon"
                  @update:model-value="couponValidationError = ''"
                ></VcActionInput>
              </template>
              <template #footer>
                <p
                  class="mt-8 mb-3 text-xs font-normal text-gray-400"
                  v-t="'pages.checkout.order_summary_block.warning_message'"
                ></p>
                <VcButton
                  class="uppercase w-full"
                  :is-disabled="!isValidCheckout"
                  :is-waiting="creatingOrder"
                  @click="createOrder"
                  v-t="'pages.checkout.order_summary_block.place_order_button'"
                >
                </VcButton>
                <div v-if="!isValidCheckout" class="flex space-x-2 bg-primary-100 rounded mt-3 p-3 text-xs">
                  <i class="fas fa-exclamation-triangle text-xl text-primary-600"></i>
                  <span v-t="'pages.checkout.invalid_checkout_message'"></span>
                </div>
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
  SelectAddressDialog,
  AddOrUpdateAddressDialog,
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
  CartAddressType,
  GiftItemType,
  InputAddressType,
  MemberAddressType,
  PaymentMethodType,
  PaymentType,
  ShipmentType,
  ShippingMethodType,
  ValidationErrorType,
} from "@/core/api/graphql/types";
import { useUser, useUserAddresses } from "@/shared/account";
import { AddressType } from "@/core/types";
import { addGiftItems, rejectGiftItems } from "@core/api/graphql/cart";
import { useI18n } from "vue-i18n";

const { me: user, isAuthenticated } = useUser();
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

const { t } = useI18n();

const {
  addresses,
  isExistAddress,
  loadAddresses,
  addOrUpdateAddresses,
  loading: loadingAddresses,
} = useUserAddresses({ user });

const { placeOrder } = useCheckout();
const { openPopup, closePopup } = usePopup();

//TODO: change 'any' for a normal type
const productCardRefs = ref<any[]>([]);
const creatingOrder = ref(false);
const completedOrder = ref({});
const showThankYou = ref(false);
const cartComment = ref("");
const cartCoupon = ref("");
const couponValidationError = ref("");
const cartCouponApplied = ref(false);
const billingSameAsShipping = ref(true);
const page = ref(1);
const purchaseOrderNumber = ref("");

const purchaseOrderNumberApplied = computed(() => !!cart.value.purchaseOrderNumber);

const cartItems = computed(() =>
  cart.value.items?.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const shipment = computed<ShipmentType | undefined>(() => cart.value.shipments?.[0]);
const payment = computed<PaymentType | undefined>(() => cart.value.payments?.[0]);

const isValidCheckout = computed(
  () =>
    !loading.value &&
    !loadingAddresses.value &&
    !cart.value.validationErrors?.length &&
    isValidShipment.value &&
    isValidPayment.value
);

const isValidShipment = computed(() => shipment.value?.shipmentMethodCode && shipment.value?.deliveryAddress);

const isValidPayment = computed(
  () => payment.value?.paymentGatewayCode && (billingSameAsShipping.value || payment.value?.billingAddress)
);

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
    couponValidationError.value = t("pages.checkout.invalid_coupon_message");
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
  creatingOrder.value = true;

  if (cartComment.value) {
    await changeComment(cartComment.value);
  }

  if (billingSameAsShipping.value) {
    await updatePayment({
      id: payment.value?.id,
      billingAddress: { ...shipment.value?.deliveryAddress },
    });
  }

  const order = await placeOrder(cart.value.id!, false);

  if (!order) {
    creatingOrder.value = false;
    return;
  }

  await saveNewAddressesInAccount();
  await loadMyCart();

  completedOrder.value = order;
  showThankYou.value = true;
  creatingOrder.value = false;
};

onBeforeUpdate(() => {
  productCardRefs.value = [];
});

onMounted(async () => {
  loadAddresses();

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

async function saveNewAddressesInAccount() {
  if (!isAuthenticated.value) return;

  const shipmentAddress = shipment.value?.deliveryAddress;
  const billingAddress = payment.value?.billingAddress;

  const newAddresses: MemberAddressType[] = [];

  if (shipmentAddress && !isExistAddress(shipmentAddress)) {
    newAddresses.push({
      ...shipmentAddress,
      isDefault: false,
      addressType: AddressType.BillingAndShipping,
    });
  }

  if (billingAddress && !billingSameAsShipping.value && !isExistAddress(billingAddress)) {
    newAddresses.push({
      ...billingAddress,
      isDefault: false,
      addressType: AddressType.BillingAndShipping,
    });
  }

  await addOrUpdateAddresses(newAddresses);
}

function showShipmentMethodDialog(): void {
  openPopup({
    component: ShippingMethodDialog,
    props: {
      currentMethodCode: shipment.value?.shipmentMethodCode,
      currentMethodOption: shipment.value?.shipmentMethodOption,
      availableMethods: cart.value.availableShippingMethods,
      async onResult(method: ShippingMethodType) {
        await updateShipment({
          shipmentMethodCode: method.code,
          shipmentMethodOption: method.optionName,
          id: shipment.value?.id,
        });
      },
    },
  });
}

function showPaymentMethodDialog(): void {
  openPopup({
    component: PaymentMethodDialog,
    props: {
      currentMethodCode: payment.value?.paymentGatewayCode,
      availableMethods: cart.value.availablePaymentMethods,
      async onResult(method: PaymentMethodType) {
        await updatePayment({
          paymentGatewayCode: method.code,
          id: payment.value?.id,
        });
      },
    },
  });
}

function selectShippingAddressDialog(): void {
  openPopup({
    component: SelectAddressDialog,
    props: {
      addresses,
      currentAddress: shipment.value?.deliveryAddress,
      async onResult(address?: InputAddressType) {
        if (!address) return;
        const convertedAddress = _.omit(address, ["isDefault"]);
        await updateShipment({
          id: shipment.value?.id,
          deliveryAddress: { ...convertedAddress },
        });
      },
      onAddNewAddress() {
        setTimeout(() => {
          addOrUpdateAddressDialog(AddressType.Shipping);
        }, 500);
      },
    },
  });
}

function selectBillingAddressDialog(): void {
  openPopup({
    component: SelectAddressDialog,
    props: {
      addresses,
      currentAddress: payment.value?.billingAddress,
      async onResult(address?: InputAddressType) {
        if (!address) return;
        const convertedAddress = _.omit(address, ["isDefault"]);
        await updatePayment({
          id: payment.value?.id,
          billingAddress: { ...convertedAddress },
        });
      },
      onAddNewAddress() {
        setTimeout(() => {
          addOrUpdateAddressDialog(AddressType.Billing);
        }, 500);
      },
    },
  });
}

function addOrUpdateAddressDialog(
  addressType: AddressType.Billing | AddressType.Shipping,
  editableAddress?: MemberAddressType | CartAddressType
): void {
  openPopup({
    component: AddOrUpdateAddressDialog,
    props: {
      address: editableAddress,
      async onResult(address: MemberAddressType) {
        closePopup();
        const newAddress = { ...address, addressType: AddressType.BillingAndShipping };
        const convertedAddress = _.omit(newAddress, ["isDefault"]);

        if (addressType.valueOf() === AddressType.Billing) {
          updatePayment({
            id: payment.value?.id,
            billingAddress: { ...convertedAddress },
          });
        } else {
          updateShipment({
            id: shipment.value?.id,
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
