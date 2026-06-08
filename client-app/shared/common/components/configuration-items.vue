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

    <div class="configuration-items__content">
      <div class="configuration-items__table-wrapper">
        <table class="configuration-items__table">
          <tbody>
            <tr
              v-for="(configurationItem, index) in configurationItems"
              :key="configurationItem.id"
              class="configuration-items__row"
            >
              <td class="configuration-items__index">{{ index + 1 }}.</td>

              <td
                v-if="hasAnySectionName"
                class="configuration-items__label"
                :title="configurationItem.sectionName ?? undefined"
              >
                <template v-if="configurationItem.sectionName">{{ configurationItem.sectionName }}:</template>
              </td>

              <td class="configuration-items__value" :title="getText(configurationItem)">
                <template v-if="configurationItem.type === CONFIGURABLE_SECTION_TYPES.file">
                  <span class="configuration-items__files">
                    <template
                      v-for="(file, fileIndex) in getFiles(configurationItem)"
                      :key="`${fileIndex}-${file.name}`"
                    >
                      <span v-if="fileIndex > 0" class="configuration-items__file-separator">, </span>

                      <VcLink
                        v-if="file.url"
                        class="configuration-items__file-link"
                        :external-link="file.url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{{ file.name }}</span>

                        <VcIcon class="configuration-items__file-icon" name="external-link" size="xs" />
                      </VcLink>

                      <span v-else>{{ file.name }}</span>
                    </template>
                  </span>
                </template>

                <VcLink
                  v-else-if="configurationItem.type === CONFIGURABLE_SECTION_TYPES.product && canEditConfiguration"
                  class="configuration-items__product-link"
                  :to="editRoute"
                >
                  {{ getText(configurationItem) }}
                </VcLink>

                <template v-else>
                  {{ getText(configurationItem) }}
                </template>
              </td>

              <td v-if="hasAnyPrice" class="configuration-items__price">
                <template v-if="hasPrice(configurationItem)">
                  +<VcPriceDisplay :value="configurationItem.extendedPrice!" />
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <VcButton
        v-if="allowEdit"
        class="configuration-items__edit"
        size="xxs"
        :to="editRoute"
        prepend-icon="edit"
        variant="no-background"
        color="accent"
      >
        {{ $t("shared.cart.configuration_items.edit_configuration") }}
      </VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import { toCSV } from "@/core/utilities/common";
import { CONFIGURABLE_SECTION_TYPES } from "@/shared/catalog/constants/configurableProducts";
import type { MoneyType } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

type ConfigurationItemFileType = { name: string; url?: string | null };

type ConfigurationItemLikeType = {
  id: string;
  type: string;
  name?: string | null;
  customText?: string | null;
  sectionName?: string | null;
  extendedPrice?: MoneyType | null;
  files?: Array<ConfigurationItemFileType | null> | null;
};

interface IProps {
  configurationItems?: ConfigurationItemLikeType[];
  lineItemId?: string;
  allowEdit?: boolean;
  route?: RouteLocationRaw;
}

const props = defineProps<IProps>();

const configurationItems = toRef(props, "configurationItems");
const lineItemId = toRef(props, "lineItemId");

const isCollapsed = ref<boolean>(true);

const hasAnySectionName = computed(() => {
  return configurationItems.value?.some((item) => Boolean(item.sectionName)) ?? false;
});

const hasAnyPrice = computed(() => {
  return configurationItems.value?.some((item) => hasPrice(item)) ?? false;
});

const editRoute = computed(() => {
  if (typeof props.route === "string") {
    return { path: props.route, query: { lineItemId: lineItemId.value } };
  }
  if (typeof props.route === "object") {
    return { ...props.route, query: { lineItemId: lineItemId.value } };
  }
  return "";
});

const canEditConfiguration = computed(() => Boolean(props.allowEdit) && Boolean(editRoute.value));

function getFiles(configurationItem: ConfigurationItemLikeType): ConfigurationItemFileType[] {
  return configurationItem.files?.filter((file): file is ConfigurationItemFileType => file != null) ?? [];
}

function hasPrice(configurationItem: ConfigurationItemLikeType): boolean {
  const price = configurationItem.extendedPrice;
  if (!price) {
    return false;
  }
  return Number(price.amount) !== 0;
}

function getText(configurationItem: ConfigurationItemLikeType): string {
  switch (configurationItem.type) {
    case CONFIGURABLE_SECTION_TYPES.text:
      return configurationItem.customText ?? "";
    case CONFIGURABLE_SECTION_TYPES.product:
      return configurationItem.name ?? "";
    case CONFIGURABLE_SECTION_TYPES.file:
      return toCSV(getFiles(configurationItem).map((file) => file.name));
    default:
      return "";
  }
}
</script>

<style lang="scss">
.configuration-items {
  $collapsed: "";

  @apply border border-neutral-200 bg-additional-50 px-4 py-1 rounded-[--vc-radius];

  @media (max-width: 480px) {
    @apply px-2;
  }

  &--collapsed {
    $collapsed: &;
  }

  &__toggle {
    @apply flex items-center gap-1.5 h-6 text-xs font-bold;
  }

  &__content {
    @apply mt-1;

    #{$collapsed} & {
      @apply hidden;
    }
  }

  &__table-wrapper {
    @apply rounded-[--vc-radius] bg-neutral-50 px-4 pb-3 pt-2.5;

    container-type: inline-size;

    @media (max-width: 480px) {
      @apply px-2;
    }
  }

  &__table {
    @apply w-full text-xs;

    border-collapse: collapse;
    table-layout: fixed;

    @container (max-width: 360px) {
      table-layout: auto;
    }
  }

  &__row {
    &:not(:last-child) {
      td {
        @apply border-b border-neutral-100 pb-2;
      }
    }

    &:not(:first-child) {
      td {
        @apply pt-1.5;
      }
    }
  }

  &__index {
    @apply w-3 pr-0.5 align-top font-bold;
  }

  &__label {
    @apply w-32 truncate pr-4 align-top font-bold;

    @container (max-width: 360px) {
      @apply w-auto max-w-none whitespace-nowrap;
    }
  }

  &__value {
    @apply truncate pe-4 align-top;

    @container (max-width: 360px) {
      @apply whitespace-normal;
    }
  }

  &__files {
    @apply inline;
  }

  &__file-link {
    @apply inline-flex items-center gap-0.5 text-accent-500;
  }

  &__product-link {
    @apply text-accent-500;
  }

  &__file-icon {
    @apply shrink-0;
  }

  &__price {
    @apply w-32 whitespace-nowrap align-top font-bold;

    @container (max-width: 360px) {
      @apply w-auto;
    }
  }

  &__edit {
    @apply mt-1;
  }
}
</style>
