<template>
  <ConfigurationItems
    :configuration-items="enrichedConfigurationItems"
    :line-item-id="lineItemId"
    :allow-edit="allowEdit"
    :route="route"
  />
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useCartConfigurationSections } from "@/shared/cart/composables";
import { ConfigurationItems } from "@/shared/common";
import type { MoneyType } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

// Cart-only: the section name isn't on the cart item, so resolve sectionId → name from the live product configuration.

type ConfigurationItemFileType = { name: string; url?: string | null };

type CartConfigurationItemLikeType = {
  id: string;
  type: string;
  name?: string;
  customText?: string;
  sectionId?: string;
  extendedPrice?: MoneyType;
  files?: Array<ConfigurationItemFileType | null> | null;
};

interface IProps {
  productId?: string;
  configurationItems?: CartConfigurationItemLikeType[];
  lineItemId?: string;
  allowEdit?: boolean;
  route?: RouteLocationRaw;
}

const props = defineProps<IProps>();

const { sectionNamesById } = useCartConfigurationSections(toRef(props, "productId"));

const enrichedConfigurationItems = computed(() => {
  return (props.configurationItems ?? []).map((item) => ({
    id: item.id,
    type: item.type,
    name: item.name,
    customText: item.customText,
    sectionName: item.sectionId ? sectionNamesById.value[item.sectionId] : undefined,
    extendedPrice: item.extendedPrice,
    files: item.files,
  }));
});
</script>
