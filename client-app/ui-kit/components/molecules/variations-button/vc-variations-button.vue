<template>
  <div class="vc-variations-button">
    <VcButton
      class="vc-variations-button__button"
      :to="link"
      :target="targetValue"
      variant="outline"
      size="sm"
      full-width
      @click="$emit('linkClick', $event)"
    >
      {{ $t("pages.catalog.variations_button", [variationsCount]) }}
    </VcButton>

    <router-link v-if="showLink" :to="link" target="_blank" class="vc-variations-button__link">
      <VcIcon class="vc-variations-button__link-icon" name="external-link" />

      <span class="vc-variations-button__link-text">
        {{ $t("pages.catalog.show_on_a_separate_page") }}
      </span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useThemeContext } from "@/core/composables";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  link: "",
  variationsCount: 0,
});

interface IProps {
  link?: string;
  target?: BrowserTargetType;
  variationsCount?: number;
  showLink?: boolean;
}

const { themeContext } = useThemeContext();

const target = toRef(props, "target");

const targetValue = target.value || themeContext.value.settings.details_browser_target || "_blank";
</script>

<style lang="scss">
.vc-variations-button {
  --link-color: var(--vc-variations-button-link-color, theme("colors.accent.600"));
  --link-hover-color: var(--vc-variations-button-link-hover-color, theme("colors.accent.700"));

  @apply flex flex-col;

  &__link {
    --vc-icon-size: 1.25rem;
    --vc-icon-color: theme("colors.primary.500");

    @apply flex items-center gap-1 mt-2.5 text-sm text-[--link-color];

    &:hover {
      @apply text-[--link-hover-color];
    }

    @media (min-width: theme("screens.lg")) {
      @apply text-xs mt-[1.25rem];
    }
  }

  &__link-text {
    @apply truncate;
  }
}
</style>
