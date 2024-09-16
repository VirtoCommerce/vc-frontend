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
      <VcIcon class="vc-variations-button__link-icon" :size="iconSize" name="external-link" />
      <span class="vc-variations-button__link-text">
        {{ $t("pages.catalog.show_on_a_separate_page") }}
      </span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { useThemeContext } from "@/core/composables";
import { BREAKPOINTS } from "@/core/constants";
import { getLinkTarget } from "@/core/utilities/common";

interface IProps {
  link?: string;
  target?: "_blank" | "_self";
  variationsCount?: number;
  showLink?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  link: "",
  variationsCount: 0,
});

const { themeContext } = useThemeContext();
const breakpoints = useBreakpoints(BREAKPOINTS);

const targetValue = props.target || getLinkTarget(themeContext.value.settings.show_details_in_separate_tab || true);
const iconSize = breakpoints.isGreater("lg") ? "xs" : "sm";
</script>

<style lang="scss">
.vc-variations-button {
  @apply flex flex-col;

  &__link {
    @apply flex items-center gap-1 text-sm text-[--link-color] hover:text-[--link-hover-color] mt-2.5;

    @media (width > theme("screens.lg")) {
      @apply text-xs mt-[1.35rem];
    }
  }

  &__link-text {
    @apply truncate;
  }

  &__link-icon {
    @apply shrink-0 text-primary;
  }
}
</style>
