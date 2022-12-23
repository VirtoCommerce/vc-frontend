<template>
  <div class="vc-order-line-items">
    <!-- table header -->
    <div class="vc-order-line-items__header gap-x-3 px-4 py-3 border rounded-t text-sm font-bold hidden md:grid">
      <div class="vc-order-line-items__product">
        {{ $t("pages.account.order_details.line_items.product") }}
      </div>
      <div class="vc-order-line-items__properties">
        {{ $t("pages.account.order_details.line_items.properties") }}
      </div>
      <div class="vc-order-line-items__price hidden xl:block pr-4 text-right">
        {{ $t("pages.account.order_details.line_items.price_per_item") }}
      </div>
      <div class="vc-order-line-items__quantity hidden xl:block text-right">
        {{ $t("pages.account.order_details.line_items.quantity") }}
      </div>
      <div class="vc-order-line-items__total text-right">
        {{ $t("pages.account.order_details.line_items.total") }}
      </div>
    </div>

    <!-- table body -->
    <div class="flex flex-col gap-6 md:gap-0 md:border-x md:divide-y" v-if="items.length">
      <div
        v-for="item in items"
        :key="item.id"
        class="relative border rounded shadow-t-3sm md:rounded-none md:shadow-none md:border-0"
      >
        <div
          class="vc-order-line-items__line-item grid gap-x-2.5 pt-3 pl-3 pr-3.5 pb-4 md:p-4 md:gap-x-3 md:place-items-center"
        >
          <!-- Product -->
          <div class="contents vc-order-line-items__product md:flex md:gap-3 md:w-full">
            <!--  IMAGE -->
            <div
              class="vc-order-line-items__img shrink-0 w-16 h-16 md:w-[60px] md:h-[60px]"
              :class="{ 'opacity-25': !extendedItems[item.id].isProductExists }"
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
              class="vc-order-line-items__name text-sm font-extrabold md:grow lg:text-13 lg:leading-4 lg:font-bold"
              :class="{ 'opacity-25': !extendedItems[item.id].isProductExists }"
            >
              <router-link
                v-if="extendedItems[item.id].route"
                :to="extendedItems[item.id].route"
                :title="item.name"
                class="text-[color:var(--color-link)] [word-break:break-word]"
              >
                {{ item.name }}
              </router-link>

              <div class="[word-break:break-word]" v-else>
                {{ item.name }}
              </div>
            </div>
          </div>

          <!-- Properties -->
          <div class="vc-order-line-items__props w-full xl:contents">
            <!-- PROPERTIES -->
            <div class="vc-order-line-items__properties w-full">
              <div
                class="grid grid-cols-[auto_1fr_auto] gap-1.5 text-13 md:grid-cols-[33%_1fr] lg:text-xs"
                v-for="property in extendedItems[item.id].properties"
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
              class="vc-order-line-items__price grid grid-cols-[auto_1fr_auto] gap-1.5 w-full md:grid-cols-[33%_1fr] xl:contents"
            >
              <div
                class="min-w-0 font-medium capitalize text-13 lg:text-xs text-gray-600 md:font-bold md:text-gray-800 xl:hidden"
              >
                <div class="truncate">{{ $t("pages.account.order_details.line_items.price_per_item") }}:</div>
              </div>

              <div class="grow mb-1 h-4 border-b-2 border-gray-200 border-dotted md:hidden"></div>

              <div class="xl:w-full xl:pr-4 xl:text-right">
                <div class="text-13 font-semibold md:font-normal lg:text-xs xl:font-medium">
                  <!-- Price per item -->
                  <VcPriceDisplay :value="item.placedPrice" />
                </div>
              </div>
            </div>
          </div>

          <!-- QUANTITY -->
          <div class="vc-order-line-items__quantity mt-3 md:place-self-end md:mt-0 xl:w-full xl:place-self-center">
            <input
              v-model="item.quantity"
              disabled
              class="w-20 h-8 border rounded text-center text-sm disabled:bg-gray-100 xl:w-full disabled:text-gray-400"
              type="number"
              pattern="\d"
              min="1"
              required
            />
          </div>

          <!-- TOTAL -->
          <div
            class="vc-quote-line-items__total flex flex-col justify-center items-end min-h-[32px] mt-3 md:mt-0 md:min-h-auto md:w-full"
          >
            <!-- Total -->
            <div class="flex flex-wrap items-center justify-end text-right gap-x-1">
              <div class="text-14 font-bold text-[color:var(--color-price-from)] md:hidden">
                {{ $t("pages.account.order_details.line_items.total") }}:
              </div>

              <div class="text-15 font-bold [word-break:break-word]">
                {{ $n(item.extendedPrice!.amount, "currency") }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-3 border-x" v-else>
      <VcAlert type="warning" icon>
        {{ $t("pages.account.order_details.no_items_message") }}
      </VcAlert>
    </div>

    <!-- table footer -->
    <div
      class="flex items-center justify-end py-2.5 gap-2 text-[color:var(--color-price)] md:px-4 md:py-2.5 md:border md:rounded-b"
    >
      <div class="text-13 font-bold">{{ $t("pages.account.order_details.line_items.subtotal") }}:</div>

      <div class="text-17 font-extrabold">{{ $n(subtotal, "currency") }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { RouteLocationRaw } from "vue-router";
import { sumBy } from "lodash";
import { OrderLineItemType, Property } from "@/xapi";
import { VcPriceDisplay } from "@/ui-kit/components";
import { getProductRoute } from "@/core";

const props = defineProps({
  items: {
    type: Array as PropType<OrderLineItemType[]>,
    required: true,
  },

  readonly: {
    type: Boolean,
  },
});

defineEmits(["remove:item", "update:item"]);

const extendedItems = computed<
  Record<string, { isProductExists: boolean; route: RouteLocationRaw; properties: Property[] }>
>(() =>
  props.items.reduce(
    (result, item: OrderLineItemType) =>
      Object.assign(result, {
        [item.id]: {
          isProductExists: !!item.product,
          route: getProductRoute(item.productId, item.product?.slug),
          properties: item.product?.properties?.slice(0, 3),
        },
      }),
    {}
  )
);
const subtotal = computed<number>(() => sumBy(props.items, (item: OrderLineItemType) => item.extendedPrice!.amount));
</script>

<style scoped lang="scss">
.vc-order-line-items {
  &__header {
    @media (min-width: theme("screens.md")) {
      grid-template-columns: 250px 1fr 100px;
      grid-template-areas: "product properties total";
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-columns: 250px 1fr 120px 88px 100px;
      grid-template-areas: "product properties price quantity total";
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
        "product props quantity"
        "product props total";
      grid-template-columns: 250px 1fr 100px;
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-areas: "product properties price quantity total";
      grid-template-columns: 250px 1fr 120px 88px 100px;
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
}
</style>
