<template>
  <div class="vc-cart-line-items">
    <!-- table header -->
    <div class="vc-cart-line-items__header gap-x-3 px-4 py-3 border rounded-t text-sm font-bold hidden md:grid">
      <div class="vc-cart-line-items__product">
        {{ $t("shared.checkout.cart_line_items.product") }}
      </div>
      <div class="vc-cart-line-items__properties">
        {{ $t("shared.checkout.cart_line_items.properties") }}
      </div>
      <div class="vc-cart-line-items__price hidden xl:block pr-4 text-right">
        {{ $t("shared.checkout.cart_line_items.price_per_item") }}
      </div>
      <div class="vc-cart-line-items__quantity hidden xl:block text-right">
        {{ $t("shared.checkout.cart_line_items.quantity") }}
      </div>
      <div class="vc-cart-line-items__total text-right">
        {{ $t("shared.checkout.cart_line_items.total") }}
      </div>
      <div class="vc-quote-line-items__remove-button w-8"></div>
    </div>

    <!-- table body -->
    <div v-if="items.length" class="flex flex-col gap-[1.875rem] md:gap-0 md:border-x md:divide-y">
      <div
        v-for="item in extendedItems"
        :key="item.id"
        class="relative border rounded shadow-t-3sm md:rounded-none md:shadow-none md:border-0"
      >
        <div
          class="vc-cart-line-items__line-item grid gap-x-2.5 pt-3 pl-3 pr-3.5 pb-4 md:p-4 md:gap-x-3 md:place-items-center"
        >
          <div class="contents vc-cart-line-items__product md:flex md:gap-3 md:w-full">
            <!--  IMAGE -->
            <div
              class="vc-cart-line-items__img shrink-0 w-16 h-16 md:w-[60px] md:h-[60px]"
              :class="{ 'opacity-25': !item.extended.isProductExists }"
            >
              <VcImage
                :src="item.imageUrl"
                :alt="item.name"
                size-suffix="sm"
                class="w-full h-full object-cover object-center"
                lazy
              />
            </div>

            <!-- NAME -->
            <div
              class="vc-cart-line-items__name text-sm font-extrabold md:grow lg:text-13 lg:leading-4 lg:font-bold"
              :class="{ 'opacity-25': !item.extended.isProductExists }"
            >
              <router-link
                v-if="item.extended.route"
                :to="item.extended.route"
                :title="item.name"
                class="text-[color:var(--color-link)] [word-break:break-word] hover:text-[color:var(--color-link-hover)]"
              >
                {{ item.name }}
              </router-link>

              <div class="[word-break:break-word]" v-else>
                {{ item.name }}
              </div>
            </div>
          </div>

          <div class="vc-cart-line-items__props w-full xl:contents">
            <!-- PROPERTIES -->
            <div class="vc-cart-line-items__properties w-full">
              <div
                class="grid grid-cols-[auto_1fr_auto] gap-1.5 text-13 md:grid-cols-[45%_1fr] lg:text-xs"
                v-for="property in item.extended.displayProperties"
                :key="property.id"
              >
                <div class="min-w-0 font-medium capitalize text-gray-600 md:font-bold md:text-gray-800">
                  <div class="truncate">{{ property.label }}:</div>
                </div>

                <div class="grow mb-1 h-4 border-b-2 border-gray-200 border-dotted md:hidden"></div>

                <div class="min-w-0">
                  <div class="truncate font-semibold md:font-normal">
                    {{ property.value }}
                  </div>
                </div>
              </div>
            </div>

            <!-- PRICE -->
            <div
              class="vc-cart-line-items__price grid grid-cols-[auto_1fr_auto] gap-1.5 w-full md:grid-cols-[45%_1fr] xl:contents"
            >
              <div
                class="min-w-0 font-medium capitalize text-13 lg:text-xs text-gray-600 md:font-bold md:text-gray-800 xl:hidden"
              >
                <div class="truncate">{{ $t("shared.checkout.cart_line_items.price_per_item") }}:</div>
              </div>

              <div class="grow mb-1 h-4 border-b-2 border-gray-200 border-dotted md:hidden"></div>

              <div class="xl:w-full xl:pr-4 xl:text-right">
                <div class="text-13 font-semibold md:font-normal lg:text-xs xl:font-medium">
                  <!-- Price per item -->
                  <VcPriceDisplay :value="item.placedPrice" />
                </div>

                <!-- Price without discount -->
                <div
                  class="text-11 leading-3 line-through text-[color:var(--color-price-old)]"
                  v-if="item.listPrice?.amount !== item.placedPrice?.amount"
                >
                  <VcPriceDisplay :value="item.listPrice" />
                </div>
              </div>
            </div>
          </div>

          <!-- QUANTITY -->
          <div class="vc-quote-line-items__quantity mt-3 md:place-self-end md:mt-0 xl:w-full xl:place-self-center">
            <!-- Is product exists - is not only about catalog persistance -->
            <input
              v-model="item.quantity"
              :name="item.id"
              :disabled="!item.extended.isProductExists || readOnly"
              class="w-20 h-8 border rounded text-center text-sm disabled:bg-gray-100 xl:w-full disabled:text-gray-400"
              required
              type="number"
              pattern="\d*"
              @focus="handleFocus(item)"
              @keyup.enter="handleUpdate(item)"
              @blur="handleUpdate(item)"
            />

            <div class="flex flex-wrap justify-center gap-1 mt-1.5">
              <VcInStock :quantity="item.inStockQuantity" is-in-stock />
            </div>
          </div>

          <!-- TOTAL -->
          <div
            class="vc-quote-line-items__total flex flex-col justify-center items-end min-h-[32px] mt-3 md:mt-0 md:min-h-auto md:w-full"
          >
            <!-- Total -->
            <div class="flex flex-wrap items-center justify-end text-right gap-x-1">
              <div class="text-14 font-bold text-[color:var(--color-price-from)] md:hidden">
                {{ $t("shared.checkout.cart_line_items.total") }}:
              </div>

              <div class="text-15 font-bold [word-break:break-word]">
                <VcPriceDisplay :value="item.extendedPrice" />
              </div>
            </div>
          </div>

          <!-- REMOVE BUTTON -->
          <div
            class="vc-cart-line-items__remove-button absolute -top-3 -right-3 md:static md:flex md:justify-end md:w-8"
          >
            <button
              type="button"
              class="flex items-center justify-center h-[26px] w-[26px] rounded-full border bg-white text-[color:var(--color-danger)] md:border-2 md:w-7 md:h-7 md:rounded hover:bg-gray-100"
              @click="$emit('remove:item', item)"
            >
              <svg class="w-3.5 h-3.5">
                <use href="/static/images/delete.svg#main"></use>
              </svg>
            </button>
          </div>
        </div>

        <!-- Line item validation error -->
        <VcAlert
          v-for="(validationError, index) in item.validationErrors"
          :key="index"
          class="-mt-0.5 mb-3 mx-3 md:-mt-2 md:mb-2.5 md:mx-4"
          icon
          text
          type="error"
        >
          {{ validationError.errorMessage }}
        </VcAlert>
      </div>
    </div>

    <!-- table footer -->
    <div
      class="flex items-center justify-end py-2.5 gap-2 text-[color:var(--color-price)] md:px-4 md:py-2.5 md:border md:rounded-b"
    >
      <div class="text-13 font-bold">{{ $t("pages.account.quote_details.line_items.subtotal") }}:</div>

      <div class="text-17 font-extrabold">{{ $n(subtotal, "currency") }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, PropType } from "vue";
import { clone, sumBy } from "lodash";
import { LineItemType, ValidationErrorType } from "@/xapi";
import { VcPriceDisplay } from "@/ui-kit/components";
import { extendCartItem } from "@/shared/checkout";

const props = defineProps({
  items: {
    type: Array as PropType<LineItemType[]>,
    required: true,
  },
  readOnly: {
    type: Boolean,
  },
  validationErrors: {
    type: Array as PropType<ValidationErrorType[]>,
    default: () => [],
  },
});

const emit = defineEmits(["remove:item", "update:item"]);

const originalSelectedItem = ref<LineItemType | undefined>();

const extendedItems = computed<ReturnType<typeof extendCartItem>[]>(() =>
  props.items.map((item: LineItemType) => extendCartItem(item, getItemValidationErrors(item.id)))
);
const subtotal = computed<number>(() => sumBy(props.items, (item: LineItemType) => item.extendedPrice?.amount));

function handleFocus(item: LineItemType): void {
  originalSelectedItem.value = clone(item);
}

function handleUpdate(item: LineItemType): void {
  if (
    item.id === originalSelectedItem.value!.id &&
    item.quantity &&
    item.quantity !== originalSelectedItem.value?.quantity
  ) {
    emit("update:item", item.id, item.quantity);
  }
}

function getItemValidationErrors(itemId: string): ValidationErrorType[] {
  return props.validationErrors.filter((error: ValidationErrorType) => error.objectId === itemId);
}
</script>

<style scoped lang="scss">
.vc-cart-line-items {
  &__header {
    @media (min-width: theme("screens.md")) {
      grid-template-columns: 250px 1fr 100px min-content;
      grid-template-areas: "product properties total remove-button";
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-columns: 250px 1fr 120px 88px 100px min-content;
      grid-template-areas: "product properties price quantity total remove-button";
    }
  }

  &__line-item {
    grid-template-areas:
      "img name name"
      "img props props"
      "img quantity total";
    grid-template-columns: 64px auto 1fr;

    @media (min-width: theme("screens.md")) {
      grid-template-areas:
        "product props quantity remove-button"
        "product props total remove-button";
      grid-template-columns: 250px 1fr 100px min-content;
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-areas: "product properties price quantity total remove-button";
      grid-template-columns: 250px 1fr 120px 88px 100px min-content;
    }
  }

  &__product {
    grid-area: product;
  }

  &__img {
    grid-area: img;
  }

  &__name {
    grid-area: name;
  }

  &__props {
    grid-area: props;
  }

  &__properties {
    grid-area: properties;
  }

  &__total {
    grid-area: total;
  }

  &__quantity {
    grid-area: quantity;
  }

  &__price {
    grid-area: price;
  }

  &__remove-button {
    grid-area: remove-button;
  }
}
</style>
