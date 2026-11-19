<template>
  <!-- The cart's and order's "Components list", read-only: a different composition needs a new subscription. -->
  <ConfigurationItems
    v-if="items.length"
    class="subscription-configuration"
    :configuration-items="items"
    :data-test-id="testId"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ConfigurationItems } from "@/shared/common";
import type { SubscriptionConfigurationFieldsFragment } from "../api/graphql/types";

interface IProps {
  configuration?: SubscriptionConfigurationFieldsFragment | null;
  testId?: string;
}

const props = defineProps<IProps>();

// The list shows a product's name for "Product" sections only; a variation section is a product choice too.
const PRODUCT_SECTION_TYPES = new Set(["Product", "Variation"]);

const { t } = useI18n();

const items = computed(() =>
  (props.configuration?.sections ?? []).map((section, index) => {
    const isProduct = PRODUCT_SECTION_TYPES.has(section.type ?? "");
    const name = section.productName ?? section.productId ?? "";
    return {
      id: section.sectionId ?? String(index),
      type: isProduct ? "Product" : (section.type ?? ""),
      // A choice that can't be ordered any more (on a delivery waiting for review) says so in its value.
      name: section.isAvailable === false ? t("product_subscriptions.configuration.unavailable_value", { name }) : name,
      customText:
        section.isAvailable === false && section.customText
          ? t("product_subscriptions.configuration.unavailable_value", { name: section.customText })
          : section.customText,
      configurationSection: { name: section.name },
      files: section.files?.map((file) => ({ name: file.name ?? file.url ?? "", url: file.url })),
    };
  }),
);
</script>

<style lang="scss">
.subscription-configuration {
  @apply mt-3;
}
</style>
