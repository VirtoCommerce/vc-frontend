<template>
  <VcWidget
    class="product-configuration"
    prepend-icon="adjustments"
    :title="$t('shared.catalog.product_details.product_configuration.title')"
    size="lg"
  >
    <div id="product-configuration-anchor" />

    <div class="product-configuration__widgets">
      <VcWidget
        v-for="(section, index) in configuration"
        :key="section.id"
        collapsible
        size="xs"
        :collapsed="index !== 0"
      >
        <template #title>
          <div class="product-configuration__title">
            {{ section.name }}
            <span v-if="section.isRequired" class="product-configuration__required">*</span>
          </div>

          <div class="product-configuration__subtitle">
            {{ section.description }}

            <div v-if="validationErrors.get(section.id)" class="product-configuration__error">
              {{ validationErrors.get(section.id) }}
            </div>

            <div
              v-else
              class="product-configuration__value"
              :class="[
                hasSelectedOption(section.id)
                  ? 'product-configuration__value--selected'
                  : 'product-configuration__value--not-selected',
                section.isRequired ? 'product-configuration__value--required' : '',
              ]"
            >
              {{ getSectionSubtitle(section) }}
            </div>
          </div>
        </template>

        <div class="product-configuration__items">
          <template v-if="section.type === CONFIGURABLE_SECTION_TYPES.product">
            <template v-for="option in section.options" :key="option.id">
              <OptionProduct
                v-if="option.product"
                :model-value="selectedConfiguration[section.id]?.productId"
                :product="option.product"
                :quantity="option.quantity"
                :list-price="option.listPrice"
                :extended-price="option.extendedPrice"
                :name="section.id"
                @input="
                  selectSectionValue({
                    sectionId: section.id,
                    productId: option.product.id,
                    quantity: option.quantity ?? 1,
                    type: section.type,
                  })
                "
              />
            </template>

            <OptionProductNone
              v-if="!section.isRequired"
              :name="section.id"
              :selected="selectedConfiguration[section.id]?.productId === undefined"
              @input="
                selectSectionValue({
                  sectionId: section.id,
                  type: section.type,
                })
              "
            />
          </template>

          <SectionText
            v-if="section.type === CONFIGURABLE_SECTION_TYPES.text"
            :section="section"
            :selected="selectedConfiguration[section.id]?.selectedOptionTextValue"
            @input="
              selectSectionValue({
                sectionId: section.id,
                customText: $event,
                type: section.type,
              })
            "
          />

          <template v-if="section.type === CONFIGURABLE_SECTION_TYPES.file">
            <OptionFile
              :is-required="section.isRequired"
              :name="section.id"
              :value="selectedConfiguration[section.id]?.files"
              @input="
                selectSectionValue({
                  sectionId: section.id,
                  files: $event,
                  type: section.type,
                })
              "
              @remove-files="
                selectSectionValue({
                  sectionId: section.id,
                  files: $event,
                  type: section.type,
                })
              "
            />

            <OptionNone
              v-if="!section.isRequired"
              :name="section.id"
              :selected="selectedConfiguration[section.id]?.selectedOptionTextValue === undefined"
              @input="
                selectSectionValue({
                  sectionId: section.id,
                  type: section.type,
                })
              "
            />
          </template>
        </div>
      </VcWidget>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import { LINE_ITEM_ID_URL_SEARCH_PARAM } from "@/core/constants";
import { getUrlSearchParam } from "@/core/utilities";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import { CONFIGURABLE_SECTION_TYPES } from "@/shared/catalog/constants/configurableProducts";
import { SaveChangesModal } from "@/shared/common";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import OptionFile from "./option-file.vue";
import OptionNone from "./option-none.vue";
import OptionProductNone from "./option-product-none.vue";
import OptionProduct from "./option-product.vue";
import type { ConfigurationSectionType } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";
import SectionText from "@/shared/catalog/components/configuration/section-text.vue";

const props = defineProps<IProps>();

const configurableLineItemId = getUrlSearchParam(LINE_ITEM_ID_URL_SEARCH_PARAM);
const NOTIFICATIONS_GROUP = "product-configuration";

interface IProps {
  configuration: DeepReadonly<ConfigurationSectionType[]>;
  productId: string;
}

const configurableProductId = toRef(props, "productId");

const { t } = useI18n();
const {
  selectSectionValue,
  selectedConfiguration,
  selectedConfigurationInput,
  isConfigurationChanged,
  changeCartConfiguredItem,
  validationErrors,
} = useConfigurableProduct(configurableProductId.value);

const { openModal } = useModal();
const notifications = useNotifications();

watch(
  () => [isConfigurationChanged.value, validationErrors.value.size === 0],
  ([isChanged, isValid]) => {
    if (isChanged && configurableLineItemId && isValid) {
      notifications.info({
        text: t("shared.catalog.product_details.product_configuration.changed_notification"),
        singleInGroup: true,
        group: NOTIFICATIONS_GROUP,
        button: {
          text: t("common.buttons.save"),
          color: "accent",
          clickHandler() {
            void changeCartConfiguredItem(configurableLineItemId, undefined, selectedConfigurationInput.value);
          },
        },
      });
    } else {
      notifications.clear(NOTIFICATIONS_GROUP);
    }
  },
);

function hasSelectedOption(sectionId: string) {
  return !!selectedConfiguration.value?.[sectionId]?.selectedOptionTextValue;
}

function getSectionSubtitle(section: DeepReadonly<ConfigurationSectionType>) {
  if (hasSelectedOption(section.id)) {
    return selectedConfiguration.value?.[section.id]?.selectedOptionTextValue;
  }
  return section.isRequired
    ? t("shared.catalog.product_details.product_configuration.required_no_selected")
    : t("shared.catalog.product_details.product_configuration.optional_no_selected");
}

async function canChangeRoute(): Promise<boolean> {
  if (!configurableLineItemId) {
    return true;
  }
  if (!isConfigurationChanged.value) {
    return true;
  }
  return await openSaveChangesModal();
}

onBeforeRouteLeave(canChangeRoute);
onBeforeRouteUpdate(canChangeRoute);

async function openSaveChangesModal(): Promise<boolean> {
  notifications.clear(NOTIFICATIONS_GROUP);
  return await new Promise<boolean>((resolve) => {
    const closeModal = openModal({
      component: SaveChangesModal,
      props: {
        title: t("common.titles.save_changes"),
        message: t("shared.catalog.product_details.product_configuration.changed_confirmation"),
        onConfirm: async () => {
          closeModal();
          if (validationErrors.value.size > 0) {
            notifications.error({
              text: t("shared.catalog.product_details.product_configuration.check_your_configuration"),
              singleInGroup: true,
              group: NOTIFICATIONS_GROUP,
            });
            return;
          }
          if (configurableLineItemId) {
            await changeCartConfiguredItem(configurableLineItemId, undefined, selectedConfigurationInput.value);
          }
          resolve(true);
        },
        onClose: () => {
          resolve(true);
        },
      },
    });
  });
}
</script>

<style lang="scss">
.product-configuration {
  $required: "";

  &__widgets {
    @apply space-y-5;
  }

  &__required {
    @apply text-danger;
  }

  &__subtitle {
    @apply mt-1 text-xs font-normal normal-case text-neutral max-w-3xl;
  }

  &__items {
    @apply @container mt-5;

    @container (max-width: theme("containers.2xl")) {
      @apply space-y-3;
    }
  }

  &__error {
    @apply text-danger-700;
  }

  &__value {
    &--selected {
      @apply text-success-600;
    }

    &--required {
      $required: &;
    }

    &--not-selected {
      @apply text-info-800;

      &#{$required} {
        @apply text-danger-800;
      }
    }
  }
}
</style>
