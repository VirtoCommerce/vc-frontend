<template>
  <VcLoaderOverlay v-if="!preparedData" no-bg />

  <VcEmptyPage
    v-else-if="!cart.items?.length"
    :title="$t('shared.cart.empty_cart.title')"
    :description="$t('shared.cart.empty_cart.description')"
    image="/static/images/errors/emptyCart.webp"
    mobile-image="/static/images/errors/emptyCartMobile.webp"
    :breadcrumbs="breadcrumbs"
  >
    <template #actions>
      <VcButton :to="{ name: 'Catalog' }" size="lg" class="w-48 uppercase font-bold">
        {{ $t("shared.cart.empty_cart.continue_shopping_button") }}
      </VcButton>
    </template>
  </VcEmptyPage>

  <div v-else class="bg-gray-100 pt-6 pb-8 shadow-inner">
    <div class="px-5 mx-auto max-w-screen-2xl 2xl:px-18">
      <!-- Mobile sticky header -->
      <div
        v-if="isVisibleStickyMobileHeader"
        class="fixed left-0 top-0 h-14 w-full z-40 px-5 md:px-12 flex justify-between items-center gap-x-3 bg-[color:var(--color-header-bottom-bg)]"
      >
        <div>
          <h2 class="text-gray-800 font-extrabold uppercase leading-none mb-1.5" v-t="'pages.cart.title'" />

          <div class="font-bold leading-none">
            <span>{{ $t("shared.checkout.order_summary.total_label") }}:</span>

            <span class="ml-1 text-green-700">
              <VcPriceDisplay :value="cart.total" />
            </span>
          </div>
        </div>

        <div>
          <VcButton
            :is-disabled="!isValidCheckout || loading || creatingQuote"
            :is-waiting="creatingOrder"
            size="sm"
            class="uppercase px-3"
            @click="createOrder"
          >
            {{ $t("pages.cart.order_summary_block.create_order_button") }}
          </VcButton>
        </div>
      </div>

      <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block mx-5 md:mx-0" />

      <!-- Title block -->
      <div class="flex justify-between items-center py-5">
        <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.cart.title'" />
      </div>

      <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
        <!-- Main section -->
        <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
          <div class="bg-white lg:mb-6 lg:rounded -mx-5 md:mx-0 lg:shadow-md-x lg:pt-5 lg:px-7">
            <div class="flex items-center px-5 lg:hidden lg:pr-0 py-6">
              <VcImage
                :src="'/static/images/checkout/shipping.svg'"
                :alt="$t('pages.cart.products_section.title')"
                class="mr-5 lg:mr-8"
              />

              <div class="w-full flex justify-between xl:mr-11 lg:mr-6">
                <h3 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">
                  {{ $t("pages.cart.products_section.title") }}
                </h3>
              </div>
            </div>

            <!-- Items grouped by Vendor -->
            <template v-if="$cfg.line_items_group_by_vendor_enabled">
              <template v-for="(item, vendorId) in groupedCartItems" :key="vendorId">
                <div
                  v-if="item.items.length"
                  class="bg-white shadow-light-lg mb-4 px-7 pt-0 md:shadow-none lg:mb-0 lg:pb-5 lg:px-0 lg:pt-0 lg:rounded"
                >
                  <!-- Vendor -->
                  <div class="pb-3 font-bold text-15">
                    <span class="mr-1">{{ $t("pages.cart.products_section.vendor_label") }}:</span>
                    <Vendor v-if="item.vendor" :vendor="item.vendor" class="inline-flex flex-row items-end gap-x-3" />
                    <span v-else class="text-gray-400" v-t="`pages.cart.products_section.empty_vendor_label`" />
                  </div>

                  <CartLineItems
                    :items="item.items"
                    :disabled="loading || creatingOrder || creatingQuote"
                    :validationErrors="cart.validationErrors"
                    @change-quantity:item="changeItemQuantity"
                    @remove:item="removeItemButtonClick"
                  />
                </div>
              </template>
            </template>

            <!-- Items not grouped by Vendor -->
            <div
              v-else
              class="bg-white shadow-light-lg mb-4 p-7 lg:mb-0 lg:pb-5 lg:px-0 lg:pt-0 lg:rounded lg:shadow-none"
            >
              <CartLineItems
                :items="cartItems"
                :disabled="loading || creatingOrder || creatingQuote"
                :validationErrors="cart.validationErrors"
                @change-quantity:item="changeItemQuantity"
                @remove:item="removeItemButtonClick"
              />
            </div>

            <div class="hidden md:flex justify-end pb-5 px-7 lg:px-0">
              <VcButton
                :is-disabled="loading || creatingOrder || creatingQuote"
                size="sm"
                kind="secondary"
                is-outline
                class="px-3 self-start uppercase font-bold"
                @click="openClearCartDialog"
              >
                {{ $t("pages.cart.products_section.clear_cart_button") }}
              </VcButton>
            </div>
          </div>

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
                  :disabled="loading || creatingOrder || creatingQuote"
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
              <CheckoutLabeledBlock :label="$t('pages.checkout.shipping_details_section.shipping_address_block.title')">
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
                      :is-disabled="loading || creatingOrder || creatingQuote"
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="
                        addresses.length
                          ? openAddressSelectionDialog(AddressType.Shipping)
                          : openAddOrUpdateAddressDialog(AddressType.Shipping, shipment?.deliveryAddress)
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
                      :is-disabled="loading || creatingOrder || creatingQuote"
                      size="sm"
                      is-outline
                      class="px-3 self-start uppercase font-bold"
                      @click="
                        addresses.length
                          ? openAddressSelectionDialog(AddressType.Shipping)
                          : openAddOrUpdateAddressDialog(AddressType.Shipping)
                      "
                    >
                      {{ $t("pages.checkout.shipping_details_section.shipping_address_block.add_address_button") }}
                    </VcButton>
                  </div>
                </template>
              </CheckoutLabeledBlock>

              <CheckoutLabeledBlock :label="$t('pages.checkout.shipping_details_section.shipping_method_block.title')">
                <div class="flex flex-row items-center space-x-4">
                  <template v-if="shipment?.shipmentMethodCode">
                    <VcImage src="/static/images/checkout/fedex.svg" class="h-12 w-12" lazy />
                    <span>
                      {{ shipment.shipmentMethodCode }}
                      {{ shipment.shipmentMethodOption }}
                      (<VcPriceDisplay :value="shipment.price" />)
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
                    :is-disabled="loading || creatingOrder || creatingQuote"
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
                    :disabled="loading || creatingOrder || creatingQuote"
                    v-model="billingSameAsShipping"
                    type="checkbox"
                    class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-[color:var(--color-primary)] checked:border-transparent focus:outline-none cursor-pointer"
                  />
                  <span
                    class="ml-2 font-medium"
                    v-t="'pages.checkout.payment_details_section.billing_address_block.same_as_shipping_checkbox_label'"
                  ></span>
                </label>
              </CheckoutLabeledBlock>

              <div
                v-if="!billingSameAsShipping && !payment?.billingAddress"
                class="border border-t-0 rounded-b -mt-6 mb-6 p-5 flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between"
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
                    :is-disabled="loading || creatingOrder || creatingQuote"
                    size="sm"
                    is-outline
                    class="px-3 self-start uppercase font-bold"
                    @click="
                      addresses.length
                        ? openAddressSelectionDialog(AddressType.Billing)
                        : openAddOrUpdateAddressDialog(AddressType.Billing)
                    "
                  >
                    {{ $t("pages.checkout.payment_details_section.billing_address_block.add_address_button") }}
                  </VcButton>
                </div>
              </div>

              <div
                v-else-if="!billingSameAsShipping && payment?.billingAddress"
                class="border border-t-0 rounded-b -mt-6 mb-6 p-5 flex flex-col space-y-2 lg:space-y-0 text-sm lg:flex-row lg:justify-between lg:space-x-3 lg:items-center"
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
                    ></span>
                    {{ payment.billingAddress?.phone }}
                  </p>

                  <p>
                    <span
                      class="font-extrabold"
                      v-t="'pages.checkout.payment_details_section.billing_address_block.email_label'"
                    ></span>
                    {{ payment.billingAddress?.email }}
                  </p>
                </div>

                <div>
                  <VcButton
                    :is-disabled="loading || creatingOrder || creatingQuote"
                    size="sm"
                    is-outline
                    class="px-3 self-start uppercase font-bold"
                    @click="
                      addresses.length
                        ? openAddressSelectionDialog(AddressType.Billing)
                        : openAddOrUpdateAddressDialog(AddressType.Billing, payment?.billingAddress)
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
                    :is-disabled="loading || creatingOrder || creatingQuote"
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
              <VcTextArea
                :label="$t('pages.checkout.extra_section.comment_label')"
                v-model="cartComment"
                :disabled="loading || creatingOrder || creatingQuote"
                :max-length="1000"
                :rows="4"
                no-resize
                counter
              />
            </div>
          </VcSection>

          <div class="shadow-inner h-2 lg:hidden"></div>
        </div>

        <!-- Sidebar -->
        <div
          class="flex flex-col gap-y-6 px-5 mb-7 order-first md:px-0 lg:mb-6 lg:order-1 lg:w-1/4 lg:h-full lg:sticky lg:top-4"
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
                :is-disabled="loading || creatingOrder || creatingQuote"
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
                :is-disabled="loading || creatingOrder || creatingQuote"
                @click:apply="useCoupon"
                @click:deny="removeCoupon"
                @update:model-value="couponValidationError = ''"
              />
            </template>

            <template #footer>
              <p
                class="mt-8 mb-5 text-xs font-normal text-gray-400"
                v-t="'pages.checkout.order_summary_block.warning_message'"
              ></p>

              <div ref="stickyMobileHeaderAnchor" class="absolute -mt-2.5"></div>

              <VcButton
                :is-disabled="!isValidCheckout || loading || creatingQuote"
                :is-waiting="creatingOrder"
                class="uppercase w-full"
                @click="createOrder"
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

          <VcCard
            v-if="$cfg.quotes_enabled && isAuthenticated"
            :title="$t('shared.checkout.quote.title')"
            header-classes="px-6 py-3"
            content-classes="px-6 pt-4 pb-5"
            shadow
          >
            <p class="mb-5 text-xs font-normal text-gray-400" v-t="'shared.checkout.quote.text'" />

            <VcButton
              :is-disabled="loading || creatingOrder"
              :is-waiting="creatingQuote"
              class="w-full uppercase"
              is-outline
              @click="createQuote"
            >
              {{ $t("shared.checkout.quote.buttons.add_items_to_quote") }}
            </VcButton>
          </VcCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, shallowRef } from "vue";
import { breakpointsTailwind, computedEager, useBreakpoints } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { omit } from "lodash";
import {
  addGiftItems,
  CartAddressType,
  GiftItemType,
  InputAddressType,
  InputPaymentType,
  MemberAddressType,
  PaymentMethodType,
  PaymentType,
  rejectGiftItems,
  ShipmentType,
  ShippingMethodType,
  LineItemType,
  Vendor as VendorType,
} from "@/xapi";
import { AddressType, useElementVisibility, usePageHead, useGoogleAnalytics, configInjectionKey } from "@/core";
import {
  AddOrUpdateAddressDialog,
  CheckoutLabeledBlock,
  OrderSummary,
  PaymentMethodDialog,
  SelectAddressDialog,
  ShippingMethodDialog,
} from "@/shared/checkout";
import { CartLineItems, ClearCartDialog, useCart } from "@/shared/cart";
import { usePopup } from "@/shared/popup";
import { useUser, useUserAddresses, useUserCheckoutDefaults } from "@/shared/account";
import { useNotifications } from "@/shared/notification";
import { Vendor } from "@/shared/catalog";

type TGroupItem = { items: LineItemType[]; vendor?: VendorType };
type TGroupedItems = Record<string, TGroupItem>;

const config = inject(configInjectionKey);

const breakpoints = useBreakpoints(breakpointsTailwind);
const notifications = useNotifications();
const router = useRouter();
const { t } = useI18n();
const { user, isAuthenticated } = useUser();
const {
  loading,
  cart,
  fetchCart,
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
  createOrderFromCart,
  createQuoteFromCart,
} = useCart();
const { addresses, isExistAddress, fetchAddresses, addOrUpdateAddresses } = useUserAddresses({ user });
const { getUserCheckoutDefaults } = useUserCheckoutDefaults();
const { openPopup, closePopup } = usePopup();
const ga = useGoogleAnalytics();

usePageHead({
  title: t("pages.cart.meta.title"),
});

const breadcrumbs: IBreadcrumbs[] = [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.cart"), route: { name: "Cart" } },
];

const groupIdWithoutVendor = "none";
const groupItemsByVendor = !!config?.line_items_group_by_vendor_enabled;

const isMobile = breakpoints.smaller("lg");
const preparedData = ref(false);
const creatingOrder = ref(false);
const creatingQuote = ref(false);
const cartComment = ref("");
const cartCoupon = ref("");
const couponValidationError = ref("");
const billingSameAsShipping = ref(true);
const purchaseOrderNumber = ref("");

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor, { direction: "top" });

const isVisibleStickyMobileHeader = computedEager<boolean>(
  () => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value
);

const purchaseOrderNumberApplied = computedEager<boolean>(() => !!cart.value.purchaseOrderNumber);
const cartCouponApplied = computedEager<boolean>(() => !!cart.value.coupons?.[0]?.code);

const cartItems = computed<LineItemType[]>(() => {
  if (groupItemsByVendor || !cart.value.items) {
    return [];
  }

  return cart.value.items;
});

const groupedCartItems = computed<TGroupedItems>(() => {
  // NOTE: The group without a vendor should be last to be displayed.
  const groupWithoutVendor: TGroupItem = { items: [] };
  const map: TGroupedItems = {};

  if (!groupItemsByVendor) {
    return map;
  }

  cart.value.items?.forEach((item) => {
    const vendor = item.product!.vendor;

    if (vendor) {
      const vendorId = vendor.id;

      map[vendorId] = map[vendorId] || { vendor, items: [] };
      map[vendorId].items.push(item);
    } else {
      groupWithoutVendor.items.push(item);
    }
  });

  // Add a group without a vendor to the end of the iteration object.
  map[groupIdWithoutVendor] = groupWithoutVendor;

  return map;
});

const shipment = computed<ShipmentType | undefined>(() => cart.value.shipments?.[0]);
const payment = computed<PaymentType | undefined>(() => cart.value.payments?.[0]);

const shippingMethods = computed<ShippingMethodType[]>(() => cart.value.availableShippingMethods ?? []);
const paymentMethods = computed<PaymentMethodType[]>(() => cart.value.availablePaymentMethods ?? []);

const isValidShipment = computed(() => shipment.value?.shipmentMethodCode && shipment.value?.deliveryAddress);
const isValidPayment = computed(
  () => payment.value?.paymentGatewayCode && (billingSameAsShipping.value || payment.value?.billingAddress)
);

const isValidCheckout = computed(
  () => !cart.value.validationErrors?.length && isValidShipment.value && isValidPayment.value
);

async function removeItemButtonClick(lineItem: LineItemType) {
  await removeItem(lineItem.id);

  /**
   * Send Google Analytics event for an item was removed from cart.
   */
  ga.removeItemFromCart(lineItem);
}

async function useCoupon() {
  const validationResult: boolean = await validateCartCoupon(cartCoupon.value);

  if (validationResult) {
    await addCartCoupon(cartCoupon.value);
    couponValidationError.value = "";
  } else {
    couponValidationError.value = t("pages.checkout.invalid_coupon_message");
  }
}

async function removeCoupon() {
  await removeCartCoupon(cartCoupon.value);
}

async function setPurchaseOrderNumber() {
  await updatePurchaseOrderNumber(purchaseOrderNumber.value);
}

async function removePurchaseOrderNumber() {
  purchaseOrderNumber.value = "";
  await updatePurchaseOrderNumber("");
}

async function prepareOrderData() {
  // Update payment with required properties
  const filledPayment: InputPaymentType = {
    id: payment.value!.id,
    amount: cart.value.total!.amount, // required
  };

  // Save shipping address as billing address
  if (billingSameAsShipping.value) {
    filledPayment.billingAddress = {
      ...shipment.value!.deliveryAddress,
      addressType: AddressType.Billing,
    };
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

async function createOrder() {
  creatingOrder.value = true;

  await prepareOrderData();

  ga.addPaymentInfo(cart.value);

  const order = await createOrderFromCart(cart.value.id!);

  if (!order) {
    creatingOrder.value = false;

    notifications.error({
      text: t("common.messages.creating_order_error"),
      duration: 15000,
      single: true,
    });

    return;
  }

  await router.push({
    name: "CheckoutComplete",
    params: {
      orderId: order.id,
      orderNumber: order.number,
    },
  });

  await fetchCart();
}

async function createQuote() {
  creatingQuote.value = true;

  const quote = await createQuoteFromCart(cart.value.id!);

  if (!quote) {
    creatingQuote.value = false;

    notifications.error({
      text: t("common.messages.creating_quote_error"),
      duration: 15000,
      single: true,
    });

    return;
  }

  await router.push({ name: "EditQuote", params: { quoteId: quote?.id } });
  await fetchCart();

  creatingQuote.value = false;
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
      availableMethods: shippingMethods.value,
      async onResult(method: ShippingMethodType) {
        await updateShipment({
          id: shipment.value?.id,
          price: method.price?.amount,
          shipmentMethodCode: method.code,
          shipmentMethodOption: method.optionName,
        });

        ga.addShippingInfo(cart.value);
      },
    },
  });
}

function showPaymentMethodDialog(): void {
  openPopup({
    component: PaymentMethodDialog,
    props: {
      currentMethodCode: payment.value?.paymentGatewayCode,
      availableMethods: paymentMethods.value,
      async onResult(method: PaymentMethodType) {
        await updatePayment({
          id: payment.value?.id,
          paymentGatewayCode: method.code,
        });
      },
    },
  });
}

async function updateBillingOrDeliveryAddress(
  addressType: AddressType.Billing | AddressType.Shipping,
  inputAddress: InputAddressType
) {
  if (addressType === AddressType.Billing) {
    await updatePayment({
      id: payment.value?.id,
      billingAddress: inputAddress,
    });
  } else {
    await updateShipment({
      id: shipment.value?.id,
      deliveryAddress: inputAddress,
    });
  }
}

function openAddOrUpdateAddressDialog(
  addressType: AddressType.Billing | AddressType.Shipping,
  editableAddress?: MemberAddressType | CartAddressType
) {
  openPopup({
    component: AddOrUpdateAddressDialog,
    props: {
      address: editableAddress,

      async onResult(address: MemberAddressType) {
        closePopup();

        const inputAddress: InputAddressType = {
          ...omit(address, ["isDefault", "description"]),
          addressType,
        };

        await updateBillingOrDeliveryAddress(addressType, inputAddress);
      },
    },
  });
}

function openAddressSelectionDialog(addressType: AddressType.Billing | AddressType.Shipping): void {
  openPopup({
    component: SelectAddressDialog,

    props: {
      addresses: addresses.value,
      currentAddress:
        addressType === AddressType.Billing ? payment.value?.billingAddress : shipment.value?.deliveryAddress,

      async onResult(address?: MemberAddressType) {
        if (!address) {
          return;
        }

        const inputAddress: InputAddressType = {
          ...omit(address, ["isDefault", "description"]),
          addressType,
        };

        await updateBillingOrDeliveryAddress(addressType, inputAddress);
      },

      onAddNewAddress() {
        setTimeout(() => {
          openAddOrUpdateAddressDialog(addressType);
        }, 500);
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

async function toggleGift(state: boolean, gift: GiftItemType) {
  if (state) {
    await addGiftItems([gift.id]);
  } else if (gift.lineItemId) {
    await rejectGiftItems([gift.lineItemId]);
  }

  await fetchCart();
}

onMounted(async () => {
  await fetchCart();

  ga.viewCart(cart.value);

  if (!cart.value.items?.length) {
    preparedData.value = true;
    return;
  }

  if (isAuthenticated.value) {
    fetchAddresses();
  }

  purchaseOrderNumber.value = cart.value.purchaseOrderNumber ?? "";
  cartCoupon.value = cart.value.coupons?.[0]?.code ?? "";
  cartComment.value = cart.value.comment ?? "";

  // Set checkout defaults
  const { shippingMethodId, paymentMethodCode } = getUserCheckoutDefaults() ?? {};
  const defaultShippingMethod = shippingMethods.value.find((item) => item.id === shippingMethodId);
  const defaultPaymentMethod = paymentMethods.value.find((item) => item.code === paymentMethodCode);
  let reloadCart = false;

  if (
    !shipment.value?.shipmentMethodCode &&
    !shipment.value?.shipmentMethodOption &&
    shippingMethodId &&
    defaultShippingMethod
  ) {
    await updateShipment(
      {
        id: shipment.value?.id,
        price: defaultShippingMethod.price?.amount,
        shipmentMethodCode: defaultShippingMethod.code,
        shipmentMethodOption: defaultShippingMethod.optionName,
      },
      false
    );
    reloadCart = true;
  }

  if (!payment.value?.paymentGatewayCode && paymentMethodCode && defaultPaymentMethod) {
    await updatePayment(
      {
        id: payment.value?.id,
        paymentGatewayCode: defaultPaymentMethod.code,
      },
      false
    );
    reloadCart = true;
  }

  if (reloadCart) {
    await fetchCart();
  }

  preparedData.value = true;
});
</script>
