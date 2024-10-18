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
  @apply flex flex-col;

  &__link {
    @apply flex items-center gap-1 text-sm text-[--link-color] hover:text-[--link-hover-color] mt-2.5;

    @media (min-width: theme("screens.lg")) {
      @apply text-xs mt-[1.25rem];
    }
  }

  &__link-text {
    @apply truncate;
  }

  &__link-icon {
    --vc-icon-size: 1.25rem;
    --vc-icon-color: theme("colors.primary.500");

    @media (min-width: theme("screens.lg")) {
      --vc-icon-size: 1.125rem;
    }
  }
}
</style>
