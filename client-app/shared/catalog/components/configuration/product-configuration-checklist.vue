<template>
  <ul
    v-if="items.length"
    class="product-configuration-checklist"
    :aria-label="$t(`${LOCALE_KEY_PREFIX}.title`)"
    data-test-id="configuration-checklist"
  >
    <li
      v-for="item in items"
      :key="item.sectionId"
      :class="['product-configuration-checklist__item', `product-configuration-checklist__item--${item.status}`]"
      data-test-id="configuration-checklist-item"
    >
      <VcIcon :name="item.status === 'done' ? 'circle-check' : 'circle-alert'" :size="16" aria-hidden="true" />

      <div class="product-configuration-checklist__content">
        <span
          :id="getLabelId(item.sectionId)"
          class="product-configuration-checklist__label"
          :title="item.label"
          data-test-id="configuration-checklist-label"
        >
          {{ item.label }}

          <span v-if="item.status === 'done'" class="sr-only">{{ $t(`${LOCALE_KEY_PREFIX}.done`) }}</span>
        </span>

        <a
          v-if="item.action"
          :href="`#${getConfigurationSectionElementId(item.sectionId)}`"
          :aria-describedby="getLabelId(item.sectionId)"
          class="product-configuration-checklist__link"
          data-test-id="configuration-checklist-link"
          @click.prevent="navigateToSection(item.sectionId)"
        >
          {{ item.action }}
        </a>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useI18n } from "vue-i18n";
import {
  getConfigurationSectionElementId,
  useConfigurableProduct,
  useConfigurationSectionNavigation,
} from "@/shared/catalog/composables";
import { CONFIGURABLE_SECTION_TYPES } from "@/shared/catalog/constants/configurableProducts";

interface IProps {
  productId: string;
}

type ChecklistItemType = {
  sectionId: string;
  status: "done" | "required" | "optional";
  label: string;
  action?: string;
};

const props = defineProps<IProps>();

const LOCALE_KEY_PREFIX = "shared.catalog.product_details.product_configuration.checklist";

const { t } = useI18n();
const productId = toRef(props, "productId");

const { configuration, selectedConfiguration, isSectionVisible } = useConfigurableProduct(productId.value);
const { navigateToSection } = useConfigurationSectionNavigation();

const items = computed<ChecklistItemType[]>(() =>
  configuration.value
    .filter((section) => isSectionVisible(section.id))
    .map((section): ChecklistItemType => {
      const name = section.name ?? "";
      const value = selectedConfiguration.value?.[section.id]?.selectedOptionTextValue;

      if (value) {
        return {
          sectionId: section.id,
          status: "done",
          // Text and file values are not repeated in the checklist, only the selected product is
          label:
            section.type === CONFIGURABLE_SECTION_TYPES.product
              ? t(`${LOCALE_KEY_PREFIX}.selected`, { name, value })
              : name,
        };
      }

      if (section.isRequired) {
        return {
          sectionId: section.id,
          status: "required",
          label: t(`${LOCALE_KEY_PREFIX}.required`, { name }),
          action: getRequiredActionText(section.type),
        };
      }

      return {
        sectionId: section.id,
        status: "optional",
        label: t(`${LOCALE_KEY_PREFIX}.optional`, { name }),
        action: t(`${LOCALE_KEY_PREFIX}.review`),
      };
    }),
);

function getLabelId(sectionId: string) {
  return `${getConfigurationSectionElementId(sectionId)}-checklist-label`;
}

function getRequiredActionText(sectionType: string) {
  switch (sectionType) {
    case CONFIGURABLE_SECTION_TYPES.text:
      return t(`${LOCALE_KEY_PREFIX}.fill_it_in`);
    case CONFIGURABLE_SECTION_TYPES.file:
      return t(`${LOCALE_KEY_PREFIX}.upload_file`);
    default:
      return t(`${LOCALE_KEY_PREFIX}.check_it_out`);
  }
}
</script>

<style lang="scss">
.product-configuration-checklist {
  @apply space-y-3.5 rounded-[--vc-radius] border border-neutral-200 bg-neutral-50 p-2.5 text-xs print:hidden;

  &__item {
    @apply flex gap-2;

    &--done {
      --vc-icon-color: var(--color-success-700);

      @apply text-success-800;
    }

    &--required {
      --vc-icon-color: var(--color-danger-700);

      @apply text-danger-800;
    }

    &--optional {
      --vc-icon-color: var(--color-warning-700);

      @apply text-warning-800;
    }
  }

  &__content {
    @apply flex min-w-0 flex-col gap-0.5;
  }

  &__label {
    @apply line-clamp-2 break-words;
  }

  &__link {
    @apply self-start font-bold text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
