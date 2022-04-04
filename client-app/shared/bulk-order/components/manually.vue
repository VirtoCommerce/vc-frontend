<template>
  <section>
    <h2
      class="hidden lg:block px-5 py-2 border-b font-extrabold uppercase"
      v-t="'shared.bulk_order.manually.title'"
    ></h2>

    <div class="p-6 pb-5 md:p-5 pt-4">
      <p class="text-sm">
        {{ $t("shared.bulk_order.manually.subtitle_message_start") }}
        <router-link
          :to="{ name: 'Checkout' }"
          class="text-[color:var(--color-link)]"
          v-t="'shared.bulk_order.manually.cart_link'"
        ></router-link>
        {{ $t("shared.bulk_order.manually.subtitle_message_end") }}
      </p>

      <div class="flex flex-row gap-x-5 mt-3 mb-1.5">
        <div class="w-full font-bold" v-t="'shared.bulk_order.manually.product_sku_label'"></div>
        <div class="w-1/3 xl:w-1/4 max-w-[164px] font-bold" v-t="'shared.bulk_order.manually.quantity_label'"></div>
      </div>

      <div class="flex flex-col gap-y-5">
        <div v-for="(item, index) in items" :key="index" class="flex flex-row gap-x-5">
          <div class="w-full">
            <VcInput v-model.trim="item.productSku" :is-disabled="loading" placeholder="SKU" />
          </div>

          <div class="w-1/3 xl:w-1/4 max-w-[164px]">
            <VcInput
              v-model="item.quantity"
              :is-disabled="loading"
              :max="maxQuantity"
              min="1"
              type="number"
              placeholder="0"
              @update:modelValue="$nextTick(() => (item.quantity = String(validateQuantity($event) || '')))"
              @keypress="onKeypress"
            />
          </div>
        </div>
      </div>

      <div class="mt-4">
        <button @click="increment" class="appearance-none inline-flex items-center py-1.5 md:py-0">
          <i class="fa fa-plus mr-1.5 mt-[3px] text-primary" />
          <span
            class="leading-tight text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)] border-b border-dashed border-link hover:border-link-hover"
          >
            {{ $t("shared.bulk_order.manually.add_rows_action_link") }}
          </span>
        </button>
      </div>

      <div class="flex flex-row flex-wrap md:flex-nowrap justify-between gap-3 mt-5 mb-2 md:mb-0">
        <div class="w-auto md:w-full font-bold">
          <VcButton
            :is-disabled="!dirty || loading"
            @click="resetItems"
            kind="secondary"
            size="lg"
            class="uppercase px-5 xl:px-8"
            is-outline
          >
            {{ $t("shared.bulk_order.manually.reset_button") }}
          </VcButton>
        </div>

        <div class="w-auto md:w-1/3 xl:w-1/4 font-bold md:max-w-[164px]">
          <VcButton
            :is-disabled="!dirty"
            :is-waiting="loading"
            @click="addToCart"
            size="lg"
            class="uppercase px-5 md:px-0 md:w-full"
          >
            {{ $t("shared.bulk_order.manually.add_to_cart_button") }}
          </VcButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { VcButton, VcInput } from "@/components";
import { computed, ref, Ref } from "vue";
import { InputNewBulkItemType } from "@core/api/graphql/types";
import { maxQuantity, validateQuantity } from "@/shared/bulk-order";

type InputNewBulkItemExtendedType = { [prop in keyof InputNewBulkItemType]: string };

const emit = defineEmits<{
  (event: "add-to-cart", value: InputNewBulkItemType[]): void;
  (event: "error", value: InputNewBulkItemType[]): void;
}>();

defineProps({
  loading: Boolean,
});

const items: Ref<InputNewBulkItemExtendedType[]> = ref(createItems(5));

const dirty = computed<boolean>(() => !!items.value.filter((item) => item.productSku || +item.quantity! > 0).length);

function createItems(quantity: number): InputNewBulkItemExtendedType[] {
  return Array.from({ length: quantity }).map<InputNewBulkItemExtendedType>(() => ({
    productSku: "",
    quantity: "",
  }));
}

function resetItems() {
  items.value = createItems(items.value.length);
}

function increment() {
  items.value.push(...createItems(5));
}

function addToCart() {
  const customItems: InputNewBulkItemType[] = items.value
    .map<InputNewBulkItemType>((item) => ({
      productSku: item.productSku,
      quantity: validateQuantity(item.quantity!),
    }))
    .filter((item) => item.productSku);

  const incorrectItems = customItems.filter((item) => !Number.isInteger(item.quantity));

  if (incorrectItems.length) {
    emit("error", incorrectItems);
    return;
  }

  if (customItems.length) {
    emit("add-to-cart", customItems);
  }
}

/**
 * Ignore non-numeric keys.
 */
function onKeypress(event: KeyboardEvent) {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
}
</script>
