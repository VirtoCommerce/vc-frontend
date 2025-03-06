<template>
  <div class="rounded border bg-neutral-50 px-4 py-2">
    <button type="button" class="flex items-center gap-1 text-xs font-bold" @click="isCollapsed = !isCollapsed">
      <span>{{ $t("shared.cart.configuration_items.title") }}</span>

      <VcIcon class="text-primary" :name="isCollapsed ? 'chevron-down' : 'chevron-up'" size="xs" />
    </button>

    <ul class="space-y-1.5 pt-2 text-xs" :class="{ hidden: isCollapsed }">
      <li
        v-for="(configurationItem, index) in configurationItems"
        :key="configurationItem.id"
        class="max-w-lg truncate"
        :title="getText(configurationItem)"
      >
        {{ `${index + 1}. ${getText(configurationItem)}` }}
      </li>
      <li>
        <VcButton v-if="allowEdit" size="xs" :to="editRoute" append-icon="edit" variant="outline">
          {{ $t("shared.cart.configuration_items.edit_configuration") }}
        </VcButton>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { CONFIGURABLE_SECTION_TYPES } from "@/shared/catalog/constants/configurableProducts";
import type { CartConfigurationItemType, OrderConfigurationItemType } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

const props = defineProps<IProps>();

const { t } = useI18n();

interface IProps {
  configurationItems?: CartConfigurationItemType[] | OrderConfigurationItemType[];
  lineItemId?: string;
  allowEdit?: boolean;
  route?: RouteLocationRaw;
}

const configurationItems = toRef(props, "configurationItems");
const lineItemId = toRef(props, "lineItemId");

const isCollapsed = ref<boolean>(true);

const editRoute = computed(() => {
  if (typeof props.route === "string") {
    return { path: props.route, query: { lineItemId: lineItemId.value } };
  }
  if (typeof props.route === "object") {
    return { ...props.route, query: { lineItemId: lineItemId.value } };
  }
  return "";
});

function getText(configurationItem: CartConfigurationItemType | OrderConfigurationItemType): string {
  switch (configurationItem.type) {
    case CONFIGURABLE_SECTION_TYPES.text:
      return t("shared.cart.configuration_items.selected_text", { text: configurationItem.customText ?? "" });
    case CONFIGURABLE_SECTION_TYPES.product:
      return configurationItem.name ?? "";
    case CONFIGURABLE_SECTION_TYPES.file:
      return configurationItem.files?.map((file) => file.name).join(", ") ?? "";
    default:
      return "";
  }
}
</script>
