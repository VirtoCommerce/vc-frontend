<template>
  <section class="flex flex-col">
    <h2
      class="hidden lg:block px-5 py-2 border-b font-extrabold uppercase"
      v-t="'shared.bulk_order.copy_n_paste.title'"
    ></h2>

    <div class="p-6 pb-5 md:p-5 pt-4 h-full">
      <p class="font-bold mb-2 text-sm" v-t="'shared.bulk_order.copy_n_paste.subtitle_message'"></p>

      <p class="mb-2 text-sm text-gray-500" v-html="$t('shared.bulk_order.copy_n_paste.guide_message')"></p>

      <VcTextArea
        v-model.trim="text"
        :is-disabled="loading"
        :placeholder="$t('shared.bulk_order.copy_n_paste.text_area_placeholder')"
        class="resize-none min-h-[292px] xl:min-h-[312px]"
      />

      <div class="flex flex-wrap justify-between gap-3 mt-5 mb-2 md:mt-2 md:mb-0">
        <VcButton
          :is-disabled="!text || loading"
          @click="text = ''"
          kind="secondary"
          size="lg"
          class="uppercase px-5 xl:px-8"
          is-outline
        >
          {{ $t("shared.bulk_order.copy_n_paste.reset_button") }}
        </VcButton>

        <VcButton
          :is-disabled="!text"
          :is-waiting="loading"
          @click="addToCart"
          size="lg"
          class="flex justify-self-end uppercase px-5 xl:px-8"
        >
          {{ $t("shared.bulk_order.copy_n_paste.add_to_cart_button") }}
        </VcButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcButton, VcTextArea } from "@/components";
import { InputNewBulkItemType } from "@core/api/graphql/types";
import { validateQuantity } from "@/shared/bulk-order";

const emit = defineEmits<{
  (event: "add-to-cart", value: InputNewBulkItemType[]): void;
  (event: "error", value?: string): void;
}>();

defineProps({
  loading: Boolean,
});

const text = ref("");

async function addToCart() {
  const pattern = /^(\s*[A-Za-z0-9_-]+\s*,\s*\d{1,9}\s*)+$/;

  if (!pattern.test(text.value)) {
    emit("error");
    return;
  }

  const validItems: InputNewBulkItemType[] = text.value
    .replace(/\s*,\s*/g, ",")
    .replace(/\s+/g, " ")
    .split(" ")
    .map<InputNewBulkItemType>((item) => {
      const [productSku, quantity] = item.split(",");
      return {
        productSku,
        quantity: validateQuantity(quantity),
      };
    });

  if (validItems.length) {
    emit("add-to-cart", validItems);
  }
}
</script>
