<template>
  <VcWidget
    class="product-configuration"
    :title="$t('shared.catalog.product_details.product_configuration.title')"
    prepend-icon="adjustments"
    icon-shape
    size="lg"
  >
    <div id="product-configuration-anchor" />

    <div class="product-configuration__widgets">
      <template v-for="(section, index) in configuration" :key="section.id">
        <VcWidget
          v-if="isSectionVisible(section.id)"
          data-test-id="section"
          collapsible
          size="xs"
          :collapsed="index !== 0"
        >
          <template #title>
            <!-- The design names an optional group with a badge at the end of its header rather than
                 with a word inside the description, so required and optional read at a glance from
                 the same place. It rides in the title slot, not the append one: append is where the
                 kit keeps the collapse chevron, and a slot there would replace it. -->
            <div class="product-configuration__header">
              <div class="product-configuration__section-heading">
                <div class="product-configuration__title" data-test-id="section-title">
                  {{ section.name }}
                  <span v-if="section.isRequired" class="product-configuration__required">*</span>
                </div>

                <div class="product-configuration__subtitle" data-test-id="section-description">
                  {{ section.description }}

                  <div v-if="validationErrors.get(section.id)" class="product-configuration__error">
                    {{ validationErrors.get(section.id) }}
                  </div>

                  <div
                    v-else
                    data-test-id="section-subtitle"
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
              </div>

              <VcBadge
                v-if="!section.isRequired"
                variant="outline"
                color="accent"
                size="xs"
                class="product-configuration__optional"
                data-test-id="section-optional-badge"
              >
                {{ $t("shared.catalog.product_details.product_configuration.optional") }}
              </VcBadge>
            </div>
          </template>

          <div
            class="product-configuration__items"
            role="radiogroup"
            :aria-label="section.name"
            tabindex="-1"
            @mousedown="isMouseInteraction = true"
            @focusin="handleItemsFocusIn"
          >
            <template v-if="section.type === CONFIGURABLE_SECTION_TYPES.product">
              <template v-for="option in section.options" :key="option.id">
                <OptionProduct
                  v-if="option.product"
                  data-test-id="product-option"
                  :model-value="selectedConfiguration[section.id]?.productId"
                  :product="option.product"
                  :quantity="option.quantity"
                  :list-price="option.listPrice"
                  :sale-price="option.salePrice"
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

            <SectionTextFieldset
              v-if="section.type === CONFIGURABLE_SECTION_TYPES.text"
              data-test-id="text-option"
              :section="section"
              :initial-value="selectedConfiguration[section.id]?.selectedOptionTextValue"
              @update="
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
      </template>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { nextTick, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import { useConfigurableLineItemId, useConfigurableProduct } from "@/shared/catalog/composables";
import { CONFIGURABLE_SECTION_TYPES } from "@/shared/catalog/constants/configurableProducts";
import { SaveChangesModal } from "@/shared/common";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import OptionFile from "./option-file.vue";
import OptionNone from "./option-none.vue";
import OptionProductNone from "./option-product-none.vue";
import OptionProduct from "./option-product.vue";
import SectionTextFieldset from "./section-text-fieldset.vue";
import type { ConfigurationSectionType } from "@/core/api/graphql/types";
import type { LocalConfigurationItemType } from "@/shared/catalog/types";
import type { DeepReadonly } from "vue";

const props = defineProps<IProps>();

const { configurableLineItemId } = useConfigurableLineItemId();
const NOTIFICATIONS_GROUP = "product-configuration";

interface IProps {
  configuration: DeepReadonly<ConfigurationSectionType[]>;
  productId: string;
  initialConfiguration?: LocalConfigurationItemType[];
}

const initialConfiguration = toRef(props, "initialConfiguration");
const configurableProductId = toRef(props, "productId");

const { t } = useI18n();
const {
  fetchProductConfiguration,
  selectSectionValue,
  selectedConfiguration,
  selectedConfigurationInput,
  isConfigurationChanged,
  validateSections,
  changeCartConfiguredItem,
  validationErrors,
  isRequiredConfigurationComplete,
  loading: isDataUpdating,
  updateWithPreselectedValues,
  isSectionVisible,
} = useConfigurableProduct(configurableProductId.value);

const { openModal } = useModal();
const notifications = useNotifications();

const isMouseInteraction = ref(false);

function handleItemsFocusIn(event: FocusEvent) {
  if (isMouseInteraction.value) {
    isMouseInteraction.value = false;
    return;
  }

  const target = event.target as HTMLElement;
  const itemsContainer = event.currentTarget as HTMLElement;
  const relatedTarget = event.relatedTarget as HTMLElement | null;
  if (!itemsContainer) {
    return;
  }

  const isFocusFromOutside = !relatedTarget || !itemsContainer.contains(relatedTarget);
  if (!isFocusFromOutside || !itemsContainer.contains(target)) {
    return;
  }

  const radioInput = itemsContainer.querySelector('input[type="radio"]:checked');
  if (radioInput instanceof HTMLInputElement && target !== radioInput) {
    radioInput.focus();
  }
}

watch(
  initialConfiguration,
  async () => {
    await nextTick();
    updateWithPreselectedValues(initialConfiguration.value);
  },
  { immediate: true },
);

watch(configurableLineItemId, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    void fetchProductConfiguration();
  }
});

watch(
  () => [isConfigurationChanged.value, isRequiredConfigurationComplete.value, isDataUpdating.value],
  ([isChanged, isConfigurationValid, isUpdating]) => {
    if (isChanged && configurableLineItemId.value && isConfigurationValid && !isUpdating) {
      notifications.info({
        text: t("shared.catalog.product_details.product_configuration.changed_notification"),
        singleInGroup: true,
        group: NOTIFICATIONS_GROUP,
        button: {
          text: t("common.buttons.save"),
          color: "accent",
          clickHandler() {
            void changeCartConfiguredItem(configurableLineItemId.value!, undefined, selectedConfigurationInput.value);
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
  if (!configurableLineItemId.value) {
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
          if (!validateSections()) {
            notifications.error({
              text: t("shared.catalog.product_details.product_configuration.check_your_configuration"),
              singleInGroup: true,
              group: NOTIFICATIONS_GROUP,
            });
            return;
          }
          if (configurableLineItemId.value) {
            await changeCartConfiguredItem(configurableLineItemId.value, undefined, selectedConfigurationInput.value);
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

  --vc-widget-title-font-size: 1rem;

  // The group's header is two things on one line: the name with its subtitle, and the badge that
  // says the group may be skipped. The badge keeps its size while the name takes the rest.
  &__header {
    @apply flex items-center gap-3;
  }

  &__section-heading {
    @apply min-w-0 grow;
  }

  &__optional {
    // The body face: a badge is not a heading, and this one sits inside the widget's title, whose
    // face it was inheriting.
    @apply font-inter;

    // The design's badge corner. The theme rounds every control to a pill, which on a word this
    // short reads as a status dot rather than a label.
    --vc-badge-radius: 0.5rem;

    @apply shrink-0;
  }

  &__widgets {
    // The groups are tight plates, not the page's soft 28: nested one inside another, the same
    // radius made the inner block look like it was floating loose in the outer one. The design's
    // own step for a nested widget.
    --vc-widget-radius: 0.625rem;
    --vc-widget-title-font-size: initial;
    --vc-widget-border-color: theme("colors.neutral.200");
    --vc-widget-shadow: none;

    @apply space-y-5;
  }

  &__required {
    @apply text-danger;
  }

  &__subtitle {
    @apply mt-1 text-xs font-normal normal-case text-neutral max-w-3xl;
  }

  &__items {
    // The design's pair for an option row: the name at 16/20 and the figure at 20. Ours came out of
    // the kit at 14 for both, so the row read a size below every other listing on the page.
    --vc-product-title-font-size: 1rem;
    --vc-product-price-font-size: 1.25rem;

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
