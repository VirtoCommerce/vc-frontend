<template>
  <VcWidget v-if="isAuthenticated" :title="$t('quotes.cart_widget.title')" class="print:hidden">
    <p class="mb-5 text-xs font-normal text-neutral-400">
      {{ $t("quotes.cart_widget.quote_request_hint") }}
    </p>

    <VcButton :loading="loading" full-width variant="outline" @click="createQuote">
      {{ $t("quotes.cart_widget.create_quote_button") }}
    </VcButton>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { globals } from "@/core/globals";
import { useCreateQuoteFromCartMutation } from "@/modules/quotes/api/graphql";
import { useUser } from "@/shared/account";
import { CartDeletedProductsModal, useFullCart } from "@/shared/cart";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import type { LineItemType } from "@/core/api/graphql/types";
import type { QuoteType } from "@/modules/quotes/api/graphql/types";

interface IEmits {
  (event: "lockCart"): void;
  (event: "unlockCart"): void;
}

const emit = defineEmits<IEmits>();
const notifications = useNotifications();
const { cart, refetch } = useFullCart();
const loading = ref(false);

const router = useRouter();
const { openModal } = useModal();
const cartContainsDeletedProducts = computed(() => cart.value?.items?.some((item: LineItemType) => !item.product));

const { mutate: createQuoteFromCart } = useCreateQuoteFromCartMutation();
const { isAuthenticated } = useUser();

async function createQuote(): Promise<void> {
  if (cartContainsDeletedProducts.value) {
    openModal({
      component: CartDeletedProductsModal,
    });

    return;
  }

  loading.value = true;
  emit("lockCart");

  const result = await createQuoteFromCart({ command: { cartId: cart.value!.id, comment: "" } });
  const quote = result?.data?.createQuoteFromCart as QuoteType | undefined;

  if (quote) {
    await router.push({
      name: "EditQuote",
      params: { quoteId: quote.id },
    });
  } else {
    notifications.error({
      text: globals.i18n.global.t("quotes.errors.creating_quote_error"),
      duration: 15000,
      single: true,
    });
  }

  await refetch();

  emit("unlockCart");
  loading.value = false;
}
</script>
