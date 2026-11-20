<template>
  <div
    :class="[
      'vc-empty-view',
      `vc-empty-view--size--${size}`,
      `vc-empty-view--tone--${media.tone}`,
      `vc-empty-view--reason--${media.reason}`,
    ]"
  >
    <div class="vc-empty-view__inner">
      <div class="vc-empty-view__media" aria-hidden="true">
        <slot name="icon">
          <span class="vc-empty-view__medallion">
            <VcIcon class="vc-empty-view__glyph" :name="media.glyph" variant="outline" />
          </span>

          <VcEmptyIcon v-if="withDrawnIcon" class="vc-empty-view__drawn-icon" :name="media.icon" />
        </slot>
      </div>

      <div class="vc-empty-view__content">
        <slot>
          <div v-if="text" class="vc-empty-view__text">
            {{ text }}
          </div>

          <div v-if="description" class="vc-empty-view__description">
            {{ description }}
          </div>
        </slot>
      </div>

      <div v-if="$slots.button" class="vc-empty-view__buttons">
        <slot name="button" />
      </div>

      <div v-if="hint" class="vc-empty-view__hint">
        {{ hint }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { resolveEmptyViewMedia } from "@/ui-kit/utilities";

interface IProps {
  /** The title. */
  text?: string;
  /** The line under the title: what will show up here, or what to do next. */
  description?: string;
  /** Small text under the actions, e.g. "Error code: 404". */
  hint?: string;
  /** Why the place is empty: sets the tone, the glyph and, for system reasons, the drawn icon. */
  reason?: VcEmptyViewReasonType;
  /** What is missing: the glyph and the drawn icon of a content reason (no-data, cleared, caught-up, done). */
  entity?: VcEmptyViewEntityType;
  /** `auto` takes sm / md / lg from the width the view is given (< 37.5rem / < 60rem / wider). */
  size?: VcEmptyViewSizeType;
  /** Legacy: kit icon name; known names map to an entity, others stay as the glyph. */
  icon?: string;
  /** Legacy: `empty` = no-data, `search` = no-results, `error` = error. `reason` wins. */
  variant?: VcEmptyViewVariantType;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "auto",
});

const SIZES_WITH_DRAWN_ICON = new Set<VcEmptyViewSizeType>(["auto", "lg", "xl"]);

const media = computed(() =>
  resolveEmptyViewMedia({ reason: props.reason, entity: props.entity, variant: props.variant, icon: props.icon }),
);

const withDrawnIcon = computed(() => SIZES_WITH_DRAWN_ICON.has(props.size));
</script>

<style lang="scss">
// Size steps (Figma "Empty-state system", card 03). `auto` reads the width it is given through a container
// query; below md the explicit lg / xl step down one size.
@mixin vc-empty-view-step($step) {
  @if $step == sm {
    --title-font-size: 1rem;
    --title-line-height: 1.25rem;
    --description-font-size: 0.875rem;
    --description-line-height: 1.25rem;
    --py: 2rem;
    --px: 1.5rem;
    --gap: 0.75rem;
    --text-gap: 0.25rem;
    --text-max-width: 22.5rem;
    --media-size: 3rem;
    --glyph-size: 1.5rem;
    --medallion-display: flex;
    --drawn-display: none;
  } @else if $step == md {
    --title-font-size: 1.25rem;
    --title-line-height: 1.5rem;
    --description-font-size: 1rem;
    --description-line-height: 1.5rem;
    --py: 3rem;
    --px: 2rem;
    --gap: 1rem;
    --text-gap: 0.5rem;
    --text-max-width: 27.5rem;
    --media-size: 4rem;
    --glyph-size: 2rem;
    --medallion-display: flex;
    --drawn-display: none;
  } @else if $step == lg {
    --title-font-size: 1.25rem;
    --title-line-height: 1.625rem;
    --description-font-size: 1rem;
    --description-line-height: 1.5rem;
    --py: 3rem;
    --px: 1.5rem;
    --gap: 1.25rem;
    --text-gap: 0.5rem;
    --text-max-width: 32.5rem;
    --media-size: 7.5rem;
    --medallion-display: none;
    --drawn-display: block;
  } @else if $step == xl {
    --title-font-size: 1.5rem;
    --title-line-height: 1.875rem;
    --description-font-size: 1rem;
    --description-line-height: 1.5rem;
    --py: 3rem;
    --px: 1.5rem;
    --gap: 1.5rem;
    --text-gap: 0.5rem;
    --text-max-width: 35rem;
    --media-size: 10rem;
    --medallion-display: none;
    --drawn-display: block;
  }
}

.vc-empty-view {
  $auto: "";
  $xs: "";
  $md: "";
  $lg: "";
  $xl: "";
  $danger: "";

  container: vc-empty-view / inline-size;

  @apply flex grow flex-col w-full min-w-0 text-center;

  &--size--auto {
    $auto: &;
  }

  &--size--xs {
    $xs: &;
  }

  &--size--md {
    $md: &;
  }

  &--size--lg {
    $lg: &;
  }

  &--size--xl {
    $xl: &;
  }

  @each $tone, $glyph-step in (primary: 600, secondary: 600, danger: 500) {
    &--tone--#{$tone} {
      --medallion-bg-color: var(--vc-empty-view-#{$tone}-bg-color, var(--color-#{$tone}-100));
      --medallion-color: var(--vc-empty-view-#{$tone}-icon-color, var(--color-#{$tone}-#{$glyph-step}));
    }
  }

  &--tone--danger {
    $danger: &;
  }

  &__inner {
    @include vc-empty-view-step(sm);

    @apply flex flex-col items-center w-full gap-[--gap] py-[--py] px-[--px];

    #{$auto} & {
      @container vc-empty-view (width >= 37.5rem) {
        @include vc-empty-view-step(md);
      }

      @container vc-empty-view (width >= 60rem) {
        @include vc-empty-view-step(lg);
      }
    }

    #{$md} & {
      @media (width >= theme("screens.md")) {
        @include vc-empty-view-step(md);
      }
    }

    #{$lg} & {
      @include vc-empty-view-step(md);

      @media (width >= theme("screens.md")) {
        @include vc-empty-view-step(lg);
      }
    }

    #{$xl} & {
      @include vc-empty-view-step(lg);

      --py: 2rem;

      @media (width >= theme("screens.md")) {
        @include vc-empty-view-step(xl);
      }
    }

    #{$xs} & {
      @apply flex-row gap-2 py-3 px-4 text-start;
    }
  }

  &__media {
    --vc-empty-icon-size: var(--media-size);

    @apply flex justify-center;
  }

  &__medallion {
    @apply items-center justify-center flex-none size-[--media-size] rounded-full bg-[--medallion-bg-color];

    display: var(--medallion-display);

    #{$xs} & {
      @apply size-4 bg-transparent;
    }
  }

  &__glyph {
    --vc-icon-size: var(--glyph-size);
    --vc-icon-color: var(--medallion-color);

    #{$xs} & {
      --vc-icon-size: 1rem;
      --vc-icon-color: var(--color-secondary-500);
    }

    #{$xs}#{$danger} & {
      --vc-icon-color: var(--medallion-color);
    }
  }

  &__drawn-icon {
    display: var(--drawn-display);

    #{$xs} & {
      @apply hidden;
    }
  }

  &__content {
    @apply flex flex-col items-center w-full max-w-[--text-max-width] gap-[--text-gap];

    #{$xs} & {
      @apply flex-1 items-start max-w-none;
    }
  }

  &__text {
    @apply text-[length:--title-font-size] leading-[--title-line-height] font-bold text-neutral-950 text-balance;

    #{$xs} & {
      @apply text-sm font-normal text-neutral-600;
    }
  }

  &__description {
    @apply text-[length:--description-font-size] leading-[--description-line-height] text-neutral-600 text-pretty;

    #{$xs} & {
      @apply hidden;
    }
  }

  &__buttons {
    @apply flex flex-wrap items-center justify-center gap-3 pt-1;

    #{$xs} & {
      @apply pt-0;
    }
  }

  &__hint {
    @apply text-sm text-neutral-600;
  }
}
</style>
