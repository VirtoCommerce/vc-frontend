<template>
  <div
    :class="[
      'configuration-items',
      {
        'configuration-items--collapsed': isCollapsed,
      },
    ]"
  >
    <button type="button" class="configuration-items__toggle" @click="isCollapsed = !isCollapsed">
      <span>{{ $t("shared.cart.configuration_items.title") }}</span>

      <VcIcon color="primary" :name="isCollapsed ? 'chevron-down' : 'chevron-up'" size="xs" />
    </button>

    <ul class="configuration-items__list">
      <li
        v-for="(configurationItem, index) in configurationItems"
        :key="configurationItem.id"
        class="configuration-items__item"
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
import { toCSV } from "@/core/utilities/common";
import { CONFIGURABLE_SECTION_TYPES } from "@/shared/catalog/constants/configurableProducts";
import type { RouteLocationRaw } from "vue-router";

type ConfigurationItemLikeType = {
  id: string;
  type: string;
  name?: string | null;
  customText?: string | null;
  files?: Array<{ name: string } | null> | null;
};

interface IProps {
  configurationItems?: ConfigurationItemLikeType[];
  lineItemId?: string;
  allowEdit?: boolean;
  route?: RouteLocationRaw;
}

const props = defineProps<IProps>();

const { t } = useI18n();

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

function getText(configurationItem: ConfigurationItemLikeType): string {
  switch (configurationItem.type) {
    case CONFIGURABLE_SECTION_TYPES.text:
      return t("shared.cart.configuration_items.selected_text", { text: configurationItem.customText ?? "" });
    case CONFIGURABLE_SECTION_TYPES.product:
      return configurationItem.name ?? "";
    case CONFIGURABLE_SECTION_TYPES.file:
      return toCSV(
        configurationItem.files
          ?.filter((file): file is NonNullable<typeof file> => file != null)
          .map((file) => file.name) ?? [],
      );
    default:
      return "";
  }
}
</script>

<style lang="scss">
.configuration-items {
  $collapsed: "";

  @apply border bg-neutral-50 px-4 py-2;

  border-radius: var(--vc-radius);

  &--collapsed {
    $collapsed: &;
  }

  &__toggle {
    @apply flex items-center gap-1 text-xs font-bold;
  }

  &__list {
    @apply space-y-1.5 pt-2 text-xs;

    #{$collapsed} & {
      @apply hidden;
    }
  }

  &__item {
    @apply max-w-lg truncate;
  }
}
</style>
