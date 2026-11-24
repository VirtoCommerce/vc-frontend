<template>
  <VcPopover
    v-if="hasPreferences"
    class="preferences-menu"
    placement="bottom-end"
    :offset-options="20"
    role="dialog"
    :aria-label="item.title"
    lazy
    shadow
    @toggle="isOpen = $event"
  >
    <template #trigger="{ opened, triggerProps }">
      <button
        ref="trigger"
        type="button"
        class="preferences-menu__trigger"
        :class="{ 'preferences-menu__trigger--opened': opened }"
        :aria-label="triggerLabel"
        data-test-id="preferences-menu-button"
        v-bind="triggerProps"
      >
        <span class="preferences-menu__value" data-test-id="preferences-menu-value">{{ triggerValue }}</span>

        <VcIcon class="preferences-menu__arrow" :name="opened ? 'chevron-up' : 'chevron-down'" size="xxs" />
      </button>
    </template>

    <template #content="{ close }">
      <div
        class="preferences-menu__panel"
        :class="{ 'preferences-menu__panel--single': !hasTwoColumns }"
        data-test-id="preferences-menu-panel"
      >
        <div v-if="isCurrencyShown || isAppearanceShown" class="preferences-menu__column">
          <div v-if="isCurrencyShown" class="preferences-menu__group">
            <div :id="currencyLabelId" class="preferences-menu__heading">
              {{ $t("shared.layout.header.preferences_menu.currency") }}
            </div>

            <CurrencyList :aria-labelledby="currencyLabelId" class="preferences-menu__list" @select="close" />
          </div>

          <div v-if="isAppearanceShown" class="preferences-menu__group">
            <div :id="appearanceLabelId" class="preferences-menu__heading">
              {{ $t("shared.layout.header.preferences_menu.appearance") }}
            </div>

            <ColorModeSwitch :aria-labelledby="appearanceLabelId" class="preferences-menu__modes" />
          </div>
        </div>

        <div v-if="isLanguageShown" class="preferences-menu__column">
          <div class="preferences-menu__group">
            <div :id="languageLabelId" class="preferences-menu__heading">
              {{ $t("shared.layout.header.preferences_menu.language") }}
            </div>

            <LanguageList :aria-labelledby="languageLabelId" class="preferences-menu__list" @select="close" />
          </div>
        </div>
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { onKeyStroke } from "@vueuse/core";
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useCurrency } from "@/core/composables/useCurrency";
import { useLanguages } from "@/core/composables/useLanguages";
import { usePreferencesMenu } from "@/shared/layout/composables/usePreferencesMenu";
import { useComponentId } from "@/ui-kit/composables";
import ColorModeSwitch from "./color-mode-switch.vue";
import CurrencyList from "./currency-list.vue";
import LanguageList from "./language-list.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  item: ExtendedMenuLinkType;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { currentCurrency } = useCurrency();
const { currentLanguage } = useLanguages();
const { isCurrencyShown, isAppearanceShown, isLanguageShown, hasPreferences } = usePreferencesMenu();

const currencyLabelId = useComponentId("preferences-menu-currency");
const appearanceLabelId = useComponentId("preferences-menu-appearance");
const languageLabelId = useComponentId("preferences-menu-language");

const isOpen = ref(false);
const trigger = useTemplateRef<HTMLButtonElement>("trigger");

const hasTwoColumns = computed(() => (isCurrencyShown.value || isAppearanceShown.value) && isLanguageShown.value);

const triggerValue = computed(() => {
  const languageCode = currentLanguage.value?.twoLetterLanguageName.toUpperCase();

  return [currentCurrency.value?.code, languageCode].filter(Boolean).join(" · ");
});

// The visible value alone ("USD · EN") does not say what the control is for, so the name leads with the menu title.
const triggerLabel = computed(() =>
  props.item.title
    ? t("shared.layout.header.preferences_menu.trigger_label", { title: props.item.title, value: triggerValue.value })
    : undefined,
);

// VcPopover takes Escape only in its panel and on its trigger: from anywhere else, close it through the trigger.
onKeyStroke("Escape", (event: KeyboardEvent) => {
  if (!isOpen.value || event.defaultPrevented) {
    return;
  }

  trigger.value?.click();
});
</script>

<style lang="scss">
.preferences-menu {
  $opened: "";

  // The surface of the language and currency dropdowns in the top header.
  --vc-popover-bg-color: var(--color-additional-50);

  &__trigger {
    --border-color: theme("colors.neutral.200");
    // The chevron of the old top header selectors.
    --vc-icon-color: theme("colors.primary.500");

    @apply flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[--border-color] px-3 py-1.5 text-sm text-[--header-bottom-link-color];

    &--opened {
      $opened: &;

      --border-color: theme("colors.primary.500");
    }

    &:hover {
      @apply text-[--header-bottom-link-hover-color];
    }

    &:hover:not(#{$opened}) {
      --border-color: theme("colors.neutral.300");
    }
  }

  &__value {
    @apply font-bold;
  }

  &__panel {
    @apply flex text-additional-950;
  }

  &__column {
    @apply min-w-64 pb-2;

    & + & {
      @apply border-s border-neutral-100;
    }
  }

  &__heading {
    @apply px-3 pb-1 pt-3 text-xs text-neutral-600;
  }

  &__modes {
    @apply mx-3 mt-1;
  }
}
</style>
