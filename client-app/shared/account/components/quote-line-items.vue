<template>
  <div class="vc-quote-line-items">
    <!-- table header -->
    <div class="vc-quote-line-items__header hidden gap-x-3 rounded-t border px-4 py-3 text-sm font-bold md:grid">
      <div class="vc-quote-line-items__product">
        {{ $t("pages.account.quote_details.line_items.product") }}
      </div>
      <div class="vc-quote-line-items__properties">
        {{ $t("pages.account.quote_details.line_items.properties") }}
      </div>
      <div class="vc-quote-line-items__price hidden pr-4 text-right xl:block">
        {{ $t("pages.account.quote_details.line_items.price_per_item") }}
      </div>
      <div class="vc-quote-line-items__quantity hidden text-right xl:block">
        {{ $t("pages.account.quote_details.line_items.quantity") }}
      </div>
      <div class="vc-quote-line-items__total text-right">
        {{ $t("pages.account.quote_details.line_items.total") }}
      </div>
      <div v-if="!readonly" class="vc-quote-line-items__remove-button w-8"></div>
    </div>

    <!-- table body -->
    <div v-if="items.length" class="flex flex-col gap-6 md:gap-0 md:divide-y md:border-x">
      <div
        v-for="item in extendedItems"
        :key="item.id"
        class="relative rounded border shadow-t-3sm md:rounded-none md:border-0 md:shadow-none"
      >
        <div
          class="vc-quote-line-items__line-item grid gap-x-2.5 pb-4 pl-3 pr-3.5 pt-3 md:place-items-center md:gap-x-3 md:p-4"
        >
          <div class="vc-quote-line-items__product contents md:flex md:w-full md:gap-3">
            <!--  IMAGE -->
            <div
              class="vc-quote-line-items__img size-16 shrink-0 md:size-[60px]"
              :class="{ 'opacity-25': !item.extended.isProductExists }"
            >
              <VcImage
                :src="item.imageUrl"
                :alt="item.name"
                size-suffix="sm"
                class="size-full object-cover object-center"
                lazy
              />
            </div>

            <!-- NAME -->
            <div
              class="vc-quote-line-items__name text-sm font-extrabold md:grow lg:font-bold lg:leading-4"
              :class="{ 'opacity-25': !item.extended.isProductExists }"
            >
              <router-link
                v-if="item.extended.route"
                :to="item.extended.route"
                :title="item.name"
                class="text-[--link-color] [word-break:break-word] hover:text-[--link-hover-color]"
              >
                {{ item.name }}
              </router-link>

              <div v-else class="[word-break:break-word]">
                {{ item.name }}
              </div>
            </div>
          </div>

          <div class="vc-quote-line-items__props w-full xl:contents">
            <!-- PROPERTIES -->
            <div class="vc-quote-line-items__properties w-full">
              <div
                v-for="property in item.extended.displayProperties"
                :key="property.id"
                class="grid grid-cols-[auto_1fr_auto] gap-1.5 text-sm md:grid-cols-[33%_1fr] lg:text-xs"
              >
                <div class="min-w-0 font-medium capitalize text-neutral-600 md:font-bold md:text-neutral-800">
                  <div class="truncate">{{ property.label }}:</div>
                </div>

                <div class="mb-1 h-4 grow border-b-2 border-dotted border-neutral-200 md:hidden"></div>

                <div class="min-w-0">
                  <div class="truncate font-semibold md:font-normal">
                    {{ property.value }}
                  </div>
                </div>
              </div>
            </div>

            <!-- PRICE -->
            <div
              class="vc-quote-line-items__price grid w-full grid-cols-[auto_1fr_auto] gap-1.5 md:grid-cols-[45%_1fr] xl:contents"
            >
              <div
                class="min-w-0 text-sm font-medium capitalize text-neutral-600 md:font-bold md:text-neutral-800 lg:text-xs xl:hidden"
              >
                <div class="truncate">{{ $t("pages.account.quote_details.line_items.price_per_item") }}:</div>
              </div>

              <div class="mb-1 h-4 grow border-b-2 border-dotted border-neutral-200 md:hidden"></div>

              <div class="xl:w-full xl:pr-4 xl:text-right">
                <div class="text-sm font-semibold md:font-normal lg:text-xs xl:font-medium">
                  <!-- Price per item -->
                  <VcPriceDisplay :value="item.selectedTierPrice!.price" />
                </div>
              </div>
            </div>
          </div>

          <!-- QUANTITY -->
          <div class="vc-quote-line-items__quantity mt-3 md:mt-0 md:place-self-end xl:w-full xl:place-self-center">
            <input
              v-model="item.selectedTierPrice!.quantity"
              :disabled="readonly"
              class="h-8 w-20 rounded border text-center text-sm disabled:bg-neutral-100 disabled:text-neutral-400 xl:w-full"
              type="number"
              pattern="\d"
              min="1"
              required
              @change="$emit('update:item', item)"
            />
          </div>

          <!-- TOTAL -->
          <div
            class="vc-quote-line-items__total md:min-h-auto mt-3 flex min-h-[32px] flex-col items-end justify-center md:mt-0 md:w-full"
          >
            <!-- Total -->
            <div class="flex flex-wrap items-center justify-end gap-x-1 text-right">
              <div class="text-14 font-bold text-neutral md:hidden">
                {{ $t("pages.account.quote_details.line_items.total") }}:
              </div>

              <div class="text-15 font-bold [word-break:break-word]">
                {{ $n(item.selectedTierPrice!.price!.amount * item.selectedTierPrice!.quantity, "currency") }}
              </div>
            </div>
          </div>

          <!-- REMOVE BUTTON -->
          <div
            v-if="!readonly"
            class="vc-quote-line-items__remove-button absolute -right-3 -top-3 md:static md:flex md:w-8 md:justify-end"
          >
            <button
              type="button"
              class="flex size-[26px] items-center justify-center rounded-full border bg-additional-50 text-danger hover:bg-neutral-100 md:size-7 md:rounded md:border-2"
              @click="$emit('remove:item', item)"
            >
              <svg class="size-3.5">
                <use href="/static/images/delete.svg#main"></use>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="border-x p-3">
      <VcAlert color="warning" size="sm" variant="outline-dark" icon>
        {{ $t("pages.account.quote_details.no_items_message") }}
      </VcAlert>
    </div>

    <!-- table footer -->
    <div class="flex items-center justify-end gap-2 py-2.5 text-success-700 md:rounded-b md:border md:px-4 md:py-2.5">
      <div class="text-sm font-bold">{{ $t("pages.account.quote_details.line_items.subtotal") }}:</div>

      <div class="text-base font-black">{{ $n(subtotal, "currency") }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sumBy } from "lodash";
import { computed } from "vue";
import { extendLineItem } from "@/core/utilities";
import type { QuoteItemType } from "@/core/api/graphql/types";
import type { ExtendedLineItemType } from "@/core/types";

interface IEmits {
  (event: "update:item", value: ExtendedLineItemType<QuoteItemType>): void;
  (event: "remove:item", value: ExtendedLineItemType<QuoteItemType>): void;
}

interface IProps {
  readonly?: boolean;
  items: QuoteItemType[];
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const extendedItems = computed<ExtendedLineItemType<QuoteItemType>[]>(() =>
  props.items.map((item: QuoteItemType) => extendLineItem<QuoteItemType>(item)),
);

const subtotal = computed<number>(() =>
  sumBy(props.items, (item: QuoteItemType) => item.selectedTierPrice!.price!.amount * item.selectedTierPrice!.quantity),
);
</script>

<style scoped lang="scss">
.vc-quote-line-items {
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
