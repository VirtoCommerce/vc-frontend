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
        <span class="preferences-menu__value" data-test-id="preferences-menu-value">{{
          triggerValue || item.title
        }}</span>

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
          <div v-if="isCurrencyShown" class="preferences-menu__group preferences-menu__group--list">
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
          <div class="preferences-menu__group preferences-menu__group--list">
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
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useCurrency } from "@/core/composables/useCurrency";
import { useLanguages } from "@/core/composables/useLanguages";
import { usePopoverEscape } from "@/shared/layout/composables/usePopoverEscape";
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

usePopoverEscape(trigger, isOpen);

const hasTwoColumns = computed(() => (isCurrencyShown.value || isAppearanceShown.value) && isLanguageShown.value);

// Only the values the panel offers a choice of; with appearance alone, the trigger shows the menu's title.
const triggerValue = computed(() =>
  [
    isCurrencyShown.value ? currentCurrency.value?.code : undefined,
    isLanguageShown.value ? currentLanguage.value?.twoLetterLanguageName.toUpperCase() : undefined,
  ]
    .filter(Boolean)
    .join(" · "),
);

// The visible value alone ("USD · EN") does not say what the control is for, so the name leads with the menu title.
const triggerLabel = computed(() =>
  props.item.title && triggerValue.value
    ? t("shared.layout.header.preferences_menu.trigger_label", { title: props.item.title, value: triggerValue.value })
    : undefined,
);
</script>

<style lang="scss">
.preferences-menu {
  $opened: "";

  // A bordered pill next to text links needs air.
  @apply ms-2;

  --vc-popover-bg-color: var(--color-additional-50);
  --vc-popover-padding: theme("spacing.4");

  &__trigger {
    --border-color: theme("colors.neutral.200");
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
    @apply flex gap-4 text-additional-950;

    // The notifications dropdown's reserve in the same header row; the card's padding and border sit outside the panel.
    max-height: calc(100vh - 10rem - 2 * (var(--vc-popover-padding, 0px) + var(--vc-popover-border-width, 0px)));
  }

  &__column {
    @apply flex min-h-0 min-w-64 flex-col gap-4;
  }

  &__group {
    // neutral-200: the colour VcPopover gives its own card outline.
    @apply flex flex-col gap-0.5 rounded-[--vc-radius] border border-neutral-200 p-2;

    // Only a list gives up height when the panel is capped: it scrolls, the appearance switch stays whole.
    &--list {
      @apply min-h-0;
    }
  }

  &__list {
    // The account sidebar's row radius in classic.
    --vc-menu-item-radius: theme("borderRadius.md");

    @apply min-h-0;
  }

  &__heading {
    // px-3: the rows' own inline padding, so the caption lines up with their text.
    @apply mb-1 px-3 text-xs text-neutral-600;
  }
}
</style>
