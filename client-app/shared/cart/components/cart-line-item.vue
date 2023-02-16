<template>
  <div>
    <slot name="after" />

    <div class="vc-cart-line-item grid gap-x-2.5 pt-3 pl-3 pr-3.5 pb-4 md:p-4 md:gap-x-3 md:place-items-center">
      <div class="contents vc-cart-line-item__product md:flex md:gap-3 md:w-full">
        <!--  IMAGE -->
        <div
          class="vc-cart-line-item__img shrink-0 w-16 h-16 md:w-[60px] md:h-[60px]"
          :class="{ 'opacity-25': !extendedItem.extended.isProductExists }"
        >
          <VcImage
            :src="extendedItem.imageUrl"
            :alt="extendedItem.name"
            size-suffix="sm"
            class="w-full h-full object-cover object-center"
            lazy
          />
        </div>

        <!-- NAME -->
        <div
          class="vc-cart-line-item__name text-sm font-extrabold md:grow lg:text-13 lg:leading-4 lg:font-bold"
          :class="{ 'opacity-25': !extendedItem.extended.isProductExists }"
        >
          <router-link
            v-if="extendedItem.extended.isProductExists && extendedItem.extended.route"
            :to="extendedItem.extended.route"
            :title="extendedItem.name"
            class="text-[color:var(--color-link)] [word-break:break-word] hover:text-[color:var(--color-link-hover)]"
          >
            {{ extendedItem.name }}
          </router-link>

          <div v-else class="[word-break:break-word]">
            {{ extendedItem.name }}
          </div>
        </div>
      </div>

      <div class="vc-cart-line-item__props w-full xl:contents">
        <!-- PROPERTIES -->
        <div class="vc-cart-line-item__properties w-full">
          <div
            v-for="property in extendedItem.extended.displayProperties"
            :key="property.id"
            class="grid grid-cols-[auto_1fr_auto] gap-1.5 text-13 md:grid-cols-[45%_1fr] lg:text-xs"
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
          class="vc-cart-line-item__price grid grid-cols-[auto_1fr_auto] gap-1.5 w-full md:grid-cols-[45%_1fr] xl:contents"
        >
          <div
            class="min-w-0 font-medium capitalize text-13 lg:text-xs text-gray-600 md:font-bold md:text-gray-800 xl:hidden"
          >
            <div class="truncate">{{ $t("common.labels.price_per_item") }}:</div>
          </div>

          <div class="grow mb-1 h-4 border-b-2 border-gray-200 border-dotted md:hidden"></div>

          <div class="xl:w-full xl:pr-4 xl:text-right">
            <div class="text-13 font-semibold md:font-normal lg:text-xs xl:font-medium">
              <!-- Price per item -->
              <VcPriceDisplay :value="extendedItem.placedPrice" />
            </div>

            <!-- Price without discount -->
            <div
              v-if="extendedItem.listPrice!.amount !== extendedItem.placedPrice!.amount"
              class="text-11 leading-3 line-through text-[color:var(--color-price-old)]"
            >
              <VcPriceDisplay :value="extendedItem.listPrice" />
            </div>
          </div>
        </div>
      </div>

      <!-- QUANTITY -->
      <div class="vc-cart-line-items__quantity mt-3 md:place-self-end md:mt-0 xl:w-full xl:place-self-center">
        <input
          v-model="quantity"
          :name="extendedItem.id"
          :readonly="readonly"
          :disabled="!extendedItem.extended.isProductExists || disabled"
          :min="extendedItem.extended.minQuantity"
          :max="extendedItem.extended.maxQuantity"
          class="w-20 h-8 border rounded text-center text-sm disabled:bg-gray-100 xl:w-full disabled:text-gray-400"
          type="number"
          pattern="\d*"
          @keyup.enter="changeQuantity"
          @input="onQuantityChanged"
        />

        <div class="flex flex-wrap justify-center gap-1 mt-1.5">
          <VcInStock :quantity="extendedItem.inStockQuantity" is-in-stock />
        </div>
      </div>

      <!-- TOTAL -->
      <div
        class="vc-cart-line-items__total flex flex-col justify-center items-end min-h-[32px] mt-3 md:mt-0 md:min-h-auto md:w-full"
      >
        <!-- Total -->
        <div class="flex flex-wrap items-center justify-end text-right gap-x-1">
          <div class="text-14 font-bold text-[color:var(--color-price-from)] md:hidden">
            {{ $t("common.labels.total") }}:
          </div>

          <div class="text-15 font-bold [word-break:break-word]">
            <VcPriceDisplay :value="extendedItem.extendedPrice" />
          </div>
        </div>
      </div>

      <!-- REMOVE BUTTON -->
      <div class="vc-cart-line-item__remove-button absolute -top-3 -right-3 md:static md:flex md:justify-end md:w-8">
        <button
          type="button"
          :disabled="disabled"
          class="flex items-center justify-center h-[26px] w-[26px] rounded-full border bg-white text-[color:var(--color-danger)] md:border-2 md:w-7 md:h-7 md:rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400"
          @click="$emit('remove')"
        >
          <svg class="w-3.5 h-3.5">
            <use href="/static/images/delete.svg#main"></use>
          </svg>
        </button>
      </div>
    </div>

    <slot name="before" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { LineItemType } from "@/xapi";
import { extendCartItem } from "@/shared/checkout";

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  item: LineItemType;
}

interface IEmits {
  (event: "change:quantity", quantity: number): void;
  (event: "remove"): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
let timeoutIdOfQuantityChange: number;

const quantity = ref<number | undefined>(props.item.quantity);

const extendedItem = computed(() => extendCartItem(props.item));

function changeQuantity() {
  clearTimeout(timeoutIdOfQuantityChange);

  let newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || newQuantity < 1) {
    newQuantity = 1;
    quantity.value = 1;
  }

  if (newQuantity === props.item.quantity) {
    return;
  }

  emit("change:quantity", newQuantity);
}

function onQuantityChanged(): void {
  clearTimeout(timeoutIdOfQuantityChange);
  timeoutIdOfQuantityChange = +setTimeout(changeQuantity, 800);
}

watchEffect(() => {
  quantity.value = props.item.quantity;
});
</script>

<style scoped lang="scss">
.vc-cart-line-item {
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
