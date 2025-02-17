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
          {{ section.name }}

          <div v-if="section.description" class="product-configuration__description">
            {{ section.description }}
          </div>

          <div class="product-configuration__subtitle">
            {{ getSectionSubtitle(section) }}
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
                  handleInput({
                    sectionId: section.id,
                    option: { productId: option.product.id, quantity: option.quantity ?? 1 },
                    type: section.type,
                  })
                "
              />
            </template>
            <OptionProductNone
              v-if="!section.isRequired"
              name="section.id"
              :selected="selectedConfiguration[section.id]?.productId === undefined"
              @input="
                handleInput({
                  sectionId: section.id,
                  option: undefined,
                  type: section.type,
                })
              "
            />
          </template>

          <template v-if="section.type === CONFIGURABLE_SECTION_TYPES.text">
            <OptionText
              :name="section.id"
              :is-required="section.isRequired"
              :value="selectedConfiguration[section.id]?.selectedOptionTextValue"
              :selected="!!selectedConfiguration[section.id]"
              @input="
                handleInput({
                  sectionId: section.id,
                  customText: $event,
                  type: section.type,
                })
              "
            />
            <OptionNone
              v-if="!section.isRequired"
              :name="section.id"
              :selected="selectedConfiguration[section.id]?.selectedOptionTextValue === undefined"
              @input="
                handleInput({
                  sectionId: section.id,
                  customText: undefined,
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
import OptionNone from "./option-none.vue";
import OptionProductNone from "./option-product-none.vue";
import OptionProduct from "./option-product.vue";
import OptionText from "./option-text.vue";
import type { ConfigurationSectionInput, ConfigurationSectionType } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

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
} = useConfigurableProduct(configurableProductId.value);

const { openModal } = useModal();
const notifications = useNotifications();

watch(isConfigurationChanged, (isChanged) => {
  if (isChanged && configurableLineItemId) {
    notifications.info({
      text: t("shared.catalog.product_details.product_configuration.changed_notification"),
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
});

function handleInput(payload: ConfigurationSectionInput) {
  selectSectionValue(payload);
}

function getSectionSubtitle(section: DeepReadonly<ConfigurationSectionType>) {
  if (selectedConfiguration.value?.[section.id]?.selectedOptionTextValue) {
    return selectedConfiguration.value?.[section.id]?.selectedOptionTextValue;
  }
  switch (section.type) {
    case CONFIGURABLE_SECTION_TYPES.product:
      return t("shared.catalog.product_details.product_configuration.nothing_selected");
    case CONFIGURABLE_SECTION_TYPES.text:
      return t("shared.catalog.product_details.product_configuration.no_text");
    default:
      return t("shared.catalog.product_details.product_configuration.nothing_selected");
  }
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
  &__widgets {
    @apply space-y-5;
  }

  &__description,
  &__subtitle {
    @apply mt-1 text-xs font-normal normal-case text-neutral max-w-3xl;
  }

  &__items {
    @apply @container mt-5;

    @container (max-width: theme("containers.2xl")) {
      @apply space-y-3;
    }
  }
}
</style>
