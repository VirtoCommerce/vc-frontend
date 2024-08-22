<template>
  <article class="flex flex-col">
    <VcTypography tag="h2" class="hidden border-b px-5 py-2 lg:block">
      {{ $t("shared.bulk_order.copy_n_paste.title") }}
    </VcTypography>
    <VcWidget size="lg">
      <p class="mb-2 text-sm font-bold">
        {{ $t("shared.bulk_order.copy_n_paste.subtitle_message") }}
      </p>

      <p v-html-safe="$t('shared.bulk_order.copy_n_paste.guide_message')" class="mb-2 text-sm text-neutral"></p>

      <VcTextarea
        v-model.trim="text"
        :disabled="loading"
        :placeholder="$t('shared.bulk_order.copy_n_paste.text_area_placeholder')"
        :rows="14"
      />

      <div class="mb-2 mt-5 flex flex-wrap justify-between gap-3 md:mb-0 md:mt-2">
        <VcButton :disabled="!text || loading" color="secondary" variant="outline" min-width="9rem" @click="resetItems">
          {{ $t("shared.bulk_order.copy_n_paste.reset_button") }}
        </VcButton>

        <VcButton :disabled="!text" :loading="loading" min-width="9rem" @click="addToCart">
          {{ $t("shared.bulk_order.copy_n_paste.add_to_cart_button") }}
        </VcButton>
      </div>
    </VcWidget>
  </article>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { validateQuantity } from "../utils";
import type { InputNewBulkItemType } from "@/core/api/graphql/types";

const emit = defineEmits<{
  (event: "addToCart", value: InputNewBulkItemType[]): void;
  (event: "error", value?: string): void;
}>();

defineProps<IProps>();

interface IProps {
  loading: boolean;
}

const text = ref("");

function addToCart(): void {
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
        quantity: validateQuantity(+quantity),
      };
    });

  if (validItems.length) {
    emit("addToCart", validItems);
  }
}

function resetItems() {
  text.value = "";
}
</script>
