<template>
  <!-- `VcConfirmationModal` takes one line of text; this one also lists the products, so it is built the same way. -->
  <VcModal
    class="subscription-confirm-modal"
    :title="title"
    :variant="variant"
    icon="warning"
    max-width="30rem"
    test-id="subscription-confirm-modal"
  >
    <div class="subscription-confirm-modal__body">
      <p v-if="lead">{{ lead }}</p>

      <VcList v-if="products.length">
        <VcListItem v-for="(product, index) in products" :key="index">
          <template #title>
            <span class="subscription-confirm-modal__product" :title="product">{{ product }}</span>
          </template>
        </VcListItem>
      </VcList>

      <p v-if="text">{{ text }}</p>

      <VcAlert v-if="error" color="danger" variant="soft" size="sm" icon>{{ error }}</VcAlert>
    </div>

    <template #actions="{ close }">
      <VcButton :disabled="loading" color="secondary" variant="outline" @click="close">
        {{ $t("ui_kit.buttons.cancel") }}
      </VcButton>

      <VcButton
        :loading="loading"
        :color="variant"
        data-test-id="subscription-confirm-modal-ok"
        @click="confirm(close)"
      >
        {{ $t("ui_kit.buttons.ok") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { subscriptionErrorMessage } from "../utils";

interface IProps {
  title: string;
  variant?: "danger" | "warning";
  /** The sentence before the product list (or the whole message when there is no list). */
  lead?: string;
  /** Product names, shown as a bulleted list; each name is cut to two lines. */
  products?: string[];
  /** The sentence after the product list. */
  text?: string;
  /** Runs the change. Rejects on failure; the dialog then shows the error and stays open. */
  onConfirm: () => Promise<void>;
}

const props = withDefaults(defineProps<IProps>(), {
  variant: "danger",
  products: () => [],
});

const { t } = useI18n();

const loading = ref(false);
const error = ref<string>();

async function confirm(close: () => void): Promise<void> {
  loading.value = true;
  error.value = undefined;
  try {
    await props.onConfirm();
    close();
  } catch (e) {
    error.value = subscriptionErrorMessage(e, t);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss">
.subscription-confirm-modal {
  &__body {
    @apply flex flex-col gap-3;
  }

  // Long product names take two lines at most; the full name is in the tooltip.
  &__product {
    @apply line-clamp-2;
  }
}
</style>
