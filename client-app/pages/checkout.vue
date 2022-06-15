<template>
  <ThankYou v-if="showThankYouStep" :order="placedOrder!" />

  <template v-else>
    <VcEmptyPage
      v-if="!cart.items?.length && !creatingOrder"
      :title="$t('shared.checkout.empty_cart.title')"
      :description="$t('shared.checkout.empty_cart.description')"
      image="/static/images/errors/emptyCart.webp"
      mobile-image="/static/images/errors/emptyCartMobile.webp"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <VcButton :to="{ name: 'Catalog' }" size="lg" class="w-48 uppercase font-bold">
          {{ $t("shared.checkout.empty_cart.continue_shopping_button") }}
        </VcButton>
      </template>
    </VcEmptyPage>

    <div v-else class="bg-gray-100 pt-7 pb-8 shadow-inner">
      <div class="max-w-screen-2xl md:px-12 mx-auto">
        <!-- Mobile sticky header -->
        <div
          v-if="isVisibleStickyMobileHeader"
          class="fixed top-0 h-14 w-full z-40 px-5 md:px-12 flex justify-between items-center gap-x-3 bg-[color:var(--color-header-bottom-bg)]"
        >
          <div>
            <h2 class="text-gray-800 font-extrabold uppercase leading-none mb-1.5" v-t="'pages.checkout.title'" />

            <div class="font-bold leading-none">
              <span>{{ $t("shared.checkout.order_summary.total_label") }}:</span>

              <span class="ml-1 text-green-700">
                <VcPriceDisplay :value="cart.total" />
              </span>
            </div>
          </div>

          <div>
            <VcButton
              :is-disabled="!isValidCheckout"
              :is-waiting="creatingOrder"
              size="sm"
              class="uppercase px-3"
              @click="placeOrder"
            >
              {{ $t("pages.checkout.order_summary_block.place_order_button") }}
            </VcButton>
          </div>
        </div>

        <h2
          class="text-gray-800 px-5 md:px-0 text-2xl lg:text-3xl font-bold uppercase mb-7"
          v-t="'pages.checkout.title'"
        />

        <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
          <!-- Main section -->
          <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
            <!-- My products section -->
            <VcSection class="shadow lg:pb-11">
              <template #title>
                <div class="flex items-center px-5 lg:pr-0 py-7">
                  <VcImage
                    :src="'/static/images/checkout/products.svg'"
                    :alt="$t('pages.checkout.products_section.title')"
                    class="mr-5 lg:mr-8"
                  />

                  <div class="w-full flex justify-between xl:mr-11 lg:mr-6">
                    <h3 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">
                      {{ $t("pages.checkout.products_section.title") }}
                    </h3>

                    <VcButton
                      :is-disabled="creatingOrder"
                      size="sm"
                      kind="secondary"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="openClearCartDialog"
                    >
                      {{ $t("pages.checkout.products_section.clear_cart_button") }}
                    </VcButton>
                  </div>
                </div>
              </template>

              <div class="xl:ml-28 lg:ml-6 xl:mr-11 lg:mr-6 lg:border lg:rounded">
                <!-- Product card -->
                <ProductCard
                  v-for="item in cartItems"
                  :key="item?.id"
                  :ref="setProductCardRef"
                  :line-item="item"
                  :read-only="creatingOrder"
                  @update:quantity="updateItemQuantity"
                  @remove:item="removeCartItem"
                  :validation-error="getItemValidationError(item?.id)"
                />

                <div v-if="pages > 1" class="py-8 lg:flex lg:items-center lg:px-5">
                  <VcPagination v-model:page="page" :pages="pages" class="mb-3 lg:mb-0" />
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
                  <VcCheckbox
                    class="mr-7"
                    :model-value="checkGift(gift)"
                    :disabled="creatingOrder"
                    @change="toggleGift($event, gift)"
                  />

                  <VcImage :src="gift.imageUrl" class="mr-4 border aspect-square w-16 h-16" lazy />

                  <div class="flex-grow font-bold text-[color:var(--color-link)]">
                    {{ gift.name }}
                  </div>
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
                    <div class="truncate">
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
                        :is-disabled="creatingOrder"
                        size="sm"
                        is-outline
                        class="px-3 self-start uppercase font-bold"
                        @click="
                          isAuthenticated && addresses.length > 0
                            ? selectShippingAddressDialog()
                            : addOrUpdateAddressDialog(AddressType.Shipping, shipment?.deliveryAddress)
                        "
                      >
                        {{ $t("pages.checkout.shipping_details_section.shipping_address_block.change_button") }}
                      </VcButton>
                    </div>
                  </template>

                  <template v-else>
                    <div class="text-[color:var(--color-danger)] flex items-center space-x-4">
                      <i class="fas fa-exclamation-triangle text-2xl" />

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
                          isAuthenticated && addresses.length > 0
                            ? selectShippingAddressDialog()
                            : addOrUpdateAddressDialog(AddressType.Shipping)
                        "
                      >
                        {{ $t("pages.checkout.shipping_details_section.shipping_address_block.add_address_button") }}
                      </VcButton>
                    </div>
                  </template>
                </CheckoutLabeledBlock>

                <CheckoutLabeledBlock
                  :label="$t('pages.checkout.shipping_details_section.shipping_method_block.title')"
                >
                  <div class="flex flex-row items-center space-x-4">
                    <template v-if="shipment?.shipmentMethodCode">
                      <VcImage src="/static/images/checkout/fedex.svg" class="h-12 w-12" lazy />
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
                      :is-disabled="creatingOrder"
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="showShipmentMethodDialog"
                    >
                      {{
                        shipment?.shipmentMethodCode
                          ? $t("pages.checkout.shipping_details_section.shipping_method_block.change_button")
                          : $t("pages.checkout.shipping_details_section.shipping_method_block.select_button")
                      }}
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
                      :disabled="creatingOrder"
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
                    <i class="fas fa-exclamation-triangle text-2xl" />

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
                        isAuthenticated && addresses.length > 0
                          ? selectBillingAddressDialog()
                          : addOrUpdateAddressDialog(AddressType.Billing)
                      "
                    >
                      {{ $t("pages.checkout.payment_details_section.billing_address_block.add_address_button") }}
                    </VcButton>
                  </div>
                </div>

                <div
                  v-else-if="!billingSameAsShipping && payment?.billingAddress"
                  class="border-b border-r border-l rounded-l-none rounded-r-none rounded -mt-6 mb-6 p-5 flex justify-between space-x-3 items-center text-sm"
                >
                  <div class="truncate">
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
                      :is-disabled="creatingOrder"
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="
                        isAuthenticated && addresses.length > 0
                          ? selectBillingAddressDialog()
                          : addOrUpdateAddressDialog(AddressType.Billing, payment?.billingAddress)
                      "
                    >
                      {{ $t("pages.checkout.payment_details_section.billing_address_block.change_button") }}
                    </VcButton>
                  </div>
                </div>

                <CheckoutLabeledBlock :label="$t('pages.checkout.payment_details_section.payment_method_block.title')">
                  <div class="flex flex-row items-center space-x-4">
                    <template v-if="payment?.paymentGatewayCode">
                      <VcImage src="/static/images/checkout/invoice.svg" class="h-12 w-12" lazy />
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
                      :is-disabled="creatingOrder"
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="showPaymentMethodDialog"
                    >
                      {{
                        payment?.paymentGatewayCode
                          ? $t("pages.checkout.payment_details_section.payment_method_block.change_button")
                          : $t("pages.checkout.payment_details_section.payment_method_block.select_button")
                      }}
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
                <p class="font-extrabold text-base mb-1" v-t="'pages.checkout.extra_section.comment_label'" />

                <VcTextArea
                  v-model="cartComment"
                  :is-disabled="creatingOrder"
                  :max-length="1000"
                  :rows="4"
                  class="resize-none"
                  counter
                />
              </div>
            </VcSection>

            <div class="shadow-inner h-2 lg:hidden"></div>
          </div>

          <!-- Sidebar -->
          <div
            class="flex flex-col px-5 mb-7 order-first md:px-0 lg:mb-6 lg:order-1 lg:w-1/4 lg:h-full lg:sticky lg:top-4"
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
                  :is-disabled="loading || creatingOrder"
                  :max-length="128"
                  @click:apply="setPurchaseOrderNumber"
                  @click:deny="removePurchaseOrderNumber"
                  @update:model-value="couponValidationError = ''"
                />

                <!-- Promotion code -->
                <VcActionInput
                  v-if="$cfg.checkout_coupon_enabled"
                  v-model="cartCoupon"
                  :class="[couponValidationError ? 'mb-0' : 'mb-8']"
                  :label="$t('pages.checkout.order_summary_block.promotion_code_label')"
                  :placeholder="$t('pages.checkout.order_summary_block.promotion_code_placeholder')"
                  :is-applied="cartCouponApplied"
                  :error-message="couponValidationError"
                  :is-disabled="loading || creatingOrder"
                  @click:apply="useCoupon"
                  @click:deny="removeCoupon"
                  @update:model-value="couponValidationError = ''"
                />
              </template>

              <template #footer>
                <p
                  class="mt-8 mb-3 text-xs font-normal text-gray-400"
                  v-t="'pages.checkout.order_summary_block.warning_message'"
                ></p>

                <div ref="stickyMobileHeaderAnchor" class="absolute -mt-2.5"></div>

                <VcButton
                  class="uppercase w-full"
                  :is-disabled="!isValidCheckout"
                  :is-waiting="creatingOrder"
                  @click="placeOrder"
                >
                  {{ $t("pages.checkout.order_summary_block.place_order_button") }}
                </VcButton>

                <div
                  v-if="!isValidCheckout && !creatingOrder"
                  class="flex items-center space-x-2 bg-primary-100 rounded mt-3 p-3 text-xs"
                >
                  <i class="fas fa-exclamation-triangle text-xl text-primary-600" />
                  <span v-t="'pages.checkout.invalid_checkout_message'" />
                </div>
              </template>
            </OrderSummary>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, onBeforeUpdate, onMounted, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import _ from "lodash";
import {
  CheckoutLabeledBlock,
  OrderSummary,
  ProductCard,
  ThankYou,
  ShippingMethodDialog,
  PaymentMethodDialog,
  SelectAddressDialog,
  AddOrUpdateAddressDialog,
  ClearCartDialog,
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
  VcEmptyPage,
  IBreadcrumbs,
} from "@/components";
import { useCart, useCheckout } from "@/shared/cart";
import { usePopup } from "@/shared/popup";
import {
  CartAddressType,
  CustomerOrderType,
  GiftItemType,
  InputAddressType,
  InputPaymentType,
  MemberAddressType,
  PaymentMethodType,
  PaymentType,
  ShipmentType,
  ShippingMethodType,
  ValidationErrorType,
} from "@/xapi/graphql/types";
import { useUser, useUserAddresses } from "@/shared/account";
import { AddressType } from "@/core/types";
import { addGiftItems, rejectGiftItems } from "@/xapi/graphql/cart";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useElementVisibility } from "@core/composables";
import { useNotifications } from "@/shared/notification";

const breakpoints = useBreakpoints(breakpointsTailwind);
const notifications = useNotifications();
const router = useRouter();
const { user, isAuthenticated } = useUser();
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
  removeCart,
} = useCart();

const { t } = useI18n();

const {
  addresses,
  isExistAddress,
  loadAddresses,
  addOrUpdateAddresses,
  loading: loadingAddresses,
} = useUserAddresses({ user });

const { createOrder } = useCheckout();
const { openPopup, closePopup } = usePopup();

const isMobile = breakpoints.smaller("lg");
const productCardRefs = ref<InstanceType<typeof ProductCard>[]>([]);
const placedOrder = shallowRef<CustomerOrderType | null>(null);
const creatingOrder = ref(false);
const showThankYouStep = ref(false);
const cartComment = ref("");
const cartCoupon = ref("");
const couponValidationError = ref("");
const cartCouponApplied = ref(false);
const billingSameAsShipping = ref(true);
const page = ref(1);
const purchaseOrderNumber = ref("");

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor, { direction: "top" });
const isVisibleStickyMobileHeader = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

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

const breadcrumbs: IBreadcrumbs[] = [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.cart"), route: { name: "Cart" } },
];

//TODO: change 'any' for a normal type
const setProductCardRef = (el: any) => {
  if (el) {
    productCardRefs.value.push(el);
  }
};

const updateItemQuantity = async (id: string, quantity: number) => {
  await changeItemQuantity(id, quantity);
};

const removeCartItem = async (id: string) => {
  await removeItem(id);
};

const useCoupon = async () => {
  const validationResult: boolean = await validateCartCoupon(cartCoupon.value);

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

async function prepareOrderData() {
  // Update payment with required properties
  const filledPayment: InputPaymentType = {
    id: payment.value!.id,
    amount: cart.value.total!.amount, // required
  };

  // Save shipping address as billing address
  if (billingSameAsShipping.value) {
    filledPayment.billingAddress = { ...shipment.value!.deliveryAddress };
  }

  await updatePayment(filledPayment, false);

  // Save order comment
  if (cartComment.value) {
    await changeComment(cartComment.value, false);
  }

  // Parallel saving of new addresses in account. Before cleaning shopping cart
  if (isAuthenticated.value) {
    saveNewAddressesInAccount({
      shipmentAddress: shipment.value!.deliveryAddress,
      billingAddress: payment.value!.billingAddress,
    });
  }
}

async function placeOrder() {
  creatingOrder.value = true;

  await prepareOrderData();

  placedOrder.value = await createOrder(cart.value.id!, false);

  if (!placedOrder.value) {
    creatingOrder.value = false;

    notifications.error({
      text: t("common.messages.creating_order_error"),
      duration: 15000,
      single: true,
    });

    return;
  }

  loadMyCart();

  if (isAuthenticated.value) {
    await router.push({ name: "OrderDetails", params: { orderId: placedOrder.value.id, new: "true" } });
  } else {
    showThankYouStep.value = true;
  }

  creatingOrder.value = false;
}

onBeforeUpdate(() => {
  productCardRefs.value = [];
});

onMounted(() => {
  loadAddresses();

  loadMyCart().then(() => {
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

async function saveNewAddressesInAccount(payload: {
  shipmentAddress?: CartAddressType;
  billingAddress?: CartAddressType;
}) {
  if (!isAuthenticated.value) {
    return;
  }

  const { shipmentAddress, billingAddress } = payload;
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
      addresses: addresses.value,
      currentAddress: shipment.value?.deliveryAddress,
      async onResult(address?: InputAddressType) {
        if (!address) {
          return;
        }
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
      addresses: addresses.value,
      currentAddress: payment.value?.billingAddress,
      async onResult(address?: InputAddressType) {
        if (!address) {
          return;
        }
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

function openClearCartDialog() {
  openPopup({
    component: ClearCartDialog,
    props: {
      onResult() {
        removeCart(cart.value.id!);
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
