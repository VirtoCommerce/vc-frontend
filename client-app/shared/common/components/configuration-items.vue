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
          <colgroup>
            <col class="configuration-items__col--index" />

            <col v-if="hasAnySectionName" class="configuration-items__col--label" />

            <!-- The value column intentionally has no width so it absorbs the remaining space -->
            <col class="configuration-items__col--value" />

            <col v-if="hasAnyPrice" class="configuration-items__col--price" />
          </colgroup>

          <thead class="configuration-items__sr-only">
            <tr>
              <th scope="col">{{ $t("shared.cart.configuration_items.columns.number") }}</th>

              <th v-if="hasAnySectionName" scope="col">
                {{ $t("shared.cart.configuration_items.columns.section") }}
              </th>

              <th scope="col">{{ $t("shared.cart.configuration_items.columns.value") }}</th>

              <th v-if="hasAnyPrice" scope="col">{{ $t("shared.cart.configuration_items.columns.price") }}</th>
            </tr>
          </thead>

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
                :title="configurationItem.configurationSection?.name ?? undefined"
              >
                <template v-if="configurationItem.configurationSection?.name">
                  {{ configurationItem.configurationSection?.name }}:
                </template>
              </td>

              <td class="configuration-items__value" :title="getText(configurationItem)">
                {{ getText(configurationItem) }}
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
  configurationSection?: { name?: string | null } | null;
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
  return configurationItems.value?.some((item) => Boolean(item.configurationSection?.name)) ?? false;
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

  @media (max-width: theme("screens.xs")) {
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

    @media (max-width: theme("screens.xs")) {
      @apply px-2;
    }
  }

  &__table {
    @apply w-full text-xs;

    border-collapse: collapse;
    table-layout: fixed;

    @container (max-width: theme("containers.xs")) {
      table-layout: auto;
    }
  }

  &__sr-only {
    @apply sr-only;
  }

  &__col--index {
    @apply w-3;

    @container (max-width: theme("containers.xs")) {
      @apply w-auto;
    }
  }

  &__col--label {
    @apply w-32;

    @container (max-width: theme("containers.xs")) {
      @apply w-auto;
    }
  }

  &__col--price {
    @apply w-32;

    @container (max-width: theme("containers.xs")) {
      @apply w-auto;
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

    // In the stacked/flex layout the row owns the bottom divider, so the td borders are reset here
    @container (max-width: theme("containers.xs")) {
      @apply flex flex-wrap items-baseline;

      &:not(:last-child) {
        @apply border-b border-neutral-100 pb-2;

        td {
          @apply border-b-0 pb-0;
        }
      }

      &:not(:first-child) {
        @apply pt-1.5;

        td {
          @apply pt-0;
        }
      }
    }
  }

  &__index {
    @apply pe-0.5 align-top font-bold;

    @container (max-width: theme("containers.xs")) {
      @apply shrink-0;
    }
  }

  &__label {
    @apply truncate pe-4 align-top font-bold;

    @container (max-width: theme("containers.xs")) {
      @apply grow basis-auto overflow-visible whitespace-normal pe-2;
    }
  }

  &__value {
    @apply truncate pe-4 align-top;

    @container (max-width: theme("containers.xs")) {
      @apply order-1 grow shrink-0 basis-full overflow-visible whitespace-normal p-0;
    }
  }

  &__price {
    @apply whitespace-nowrap align-top font-bold;

    @container (max-width: theme("containers.xs")) {
      @apply ml-auto grow-0 shrink-0 basis-auto;
    }
  }

  &__edit {
    @apply mt-1;
  }
}
</style>
