<template>
  <section>
    <h2
      v-t="'shared.bulk_order.manually.title'"
      class="hidden border-b px-5 py-2 font-extrabold uppercase lg:block"
    ></h2>

    <div class="p-6 pb-5 pt-4 md:p-5">
      <p class="text-sm">
        {{ $t("shared.bulk_order.manually.subtitle_message_start") }}
        <router-link
          v-t="'shared.bulk_order.manually.cart_link'"
          :to="{ name: 'Cart' }"
          class="text-[--link-color] hover:text-[--link-hover-color]"
        ></router-link>
        {{ $t("shared.bulk_order.manually.subtitle_message_end") }}
      </p>

      <div class="mb-1.5 mt-3 flex flex-row gap-x-5">
        <div v-t="'shared.bulk_order.manually.product_sku_label'" class="w-full font-bold"></div>
        <div v-t="'shared.bulk_order.manually.quantity_label'" class="w-1/3 max-w-[164px] font-bold xl:w-1/4"></div>
      </div>

      <div class="flex flex-col gap-y-4">
        <div v-for="(item, index) in items" :key="index" class="flex flex-row gap-x-5">
          <div class="w-full">
            <VcInput v-model.trim="item.productSku" :disabled="loading" placeholder="SKU" />
          </div>

          <div class="w-1/3 max-w-[164px] xl:w-1/4">
            <VcInput
              v-model="item.quantity"
              :disabled="loading"
              :max="maxQuantity"
              min="1"
              type="number"
              placeholder="0"
              @update:model-value="$nextTick(() => (item.quantity = String(validateQuantity(+$event!) || '')))"
              @keypress="onKeypress"
            />
          </div>
        </div>
      </div>

      <div class="mt-4">
        <button
          type="button"
          class="inline-flex appearance-none items-center gap-1.5 py-1.5 md:py-0"
          @click="increment"
        >
          <VcIcon class="text-[--color-primary-500]" name="plus" size="sm" />

          <span class="border-b border-dashed border-current text-[--color-accent-600] hover:text-[--color-accent-700]">
            {{ $t("shared.bulk_order.manually.add_rows_action_link") }}
          </span>
        </button>
      </div>

      <div class="mb-2 mt-6 flex flex-row flex-wrap justify-between gap-3 md:mb-0 md:flex-nowrap">
        <VcButton :disabled="!dirty || loading" color="secondary" variant="outline" @click="resetItems">
          {{ $t("shared.bulk_order.manually.reset_button") }}
        </VcButton>

        <VcButton :disabled="!valid" :loading="loading" @click="addToCart">
          {{ $t("shared.bulk_order.manually.add_to_cart_button") }}
        </VcButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { maxQuantity, validateQuantity } from "@/shared/bulk-order";
import type { InputNewBulkItemType } from "@/core/api/graphql/types";
import type { Ref } from "vue";

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
const valid = computed<boolean>(() => !!items.value.filter((item) => item.productSku && +item.quantity! > 0).length);

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
      quantity: validateQuantity(+item.quantity!),
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
