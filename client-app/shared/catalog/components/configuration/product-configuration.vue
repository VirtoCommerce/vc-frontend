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
          <template v-if="section.type === ProductConfigurationSectionType.Product">
            <template v-for="option in section.options" :key="option.id">
              <OptionProduct
                v-if="option.product"
                :model-value="selectedConfiguration[section.id]?.productId"
                :product="option.product"
                :quantity="option.quantity"
                :list-price="option.listPrice"
                :sale-price="option.salePrice"
                :extended-price="option.extendedPrice"
                :name="`selection-${section.id}`"
                @input="
                  handleInput({
                    sectionId: section.id,
                    option: { productId: option.product.id, quantity: option.quantity ?? 1 },
                    type: section.type as unknown as CartConfigurationItemEnumType,
                  })
                "
              />
            </template>
            <OptionProductNone
              v-if="!section.isRequired"
              :section-id="section.id"
              :selected="selectedConfiguration[section.id]?.productId === undefined"
              @input="
                handleInput({
                  sectionId: section.id,
                  option: undefined,
                  type: section.type as unknown as CartConfigurationItemEnumType,
                })
              "
            />
          </template>

          <OptionText
            v-if="section.type === ProductConfigurationSectionType.Text"
            :is-required="section.isRequired"
            :value="selectedConfiguration[section.id]?.selectedOptionTextValue"
            :selected="!!selectedConfiguration[section.id]"
            @input="
              handleInput({
                sectionId: section.id,
                customText: $event,
                type: section.type as unknown as CartConfigurationItemEnumType,
              })
            "
          />
        </div>
      </VcWidget>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import { ProductConfigurationSectionType } from "@/core/api/graphql/types";
import { LINE_ITEM_ID_URL_SEARCH_PARAM } from "@/core/constants";
import { getUrlSearchParam } from "@/core/utilities";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import { SaveChangesModal } from "@/shared/common";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import OptionProductNone from "./option-product-none.vue";
import OptionProduct from "./option-product.vue";
import OptionText from "./option-text.vue";
import type {
  CartConfigurationItemEnumType,
  ConfigurationSectionInput,
  ConfigurationSectionType,
} from "@/core/api/graphql/types";
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
    case ProductConfigurationSectionType.Product:
      return t("shared.catalog.product_details.product_configuration.nothing_selected");
    case ProductConfigurationSectionType.Text:
      return t("shared.catalog.product_details.product_configuration.no_text_entered");
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
    @apply mt-1 text-xs font-normal normal-case text-neutral;
  }

  &__items {
    @apply @container mt-5;

    @container (max-width: theme("containers.2xl")) {
      @apply space-y-3;
    }
  }
}
</style>
