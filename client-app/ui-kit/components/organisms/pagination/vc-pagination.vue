<template>
  <div
    v-if="pages > 1"
    ref="paginationRef"
    :class="[
      'vc-pagination',
      {
        'vc-pagination--compact': compact,
        'vc-pagination--wrapped': isWrapped,
      },
    ]"
  >
    <div class="vc-pagination__container">
      <div ref="pagesRef" class="vc-pagination__pages">
        <component
          :is="item > 0 && page !== item ? 'button' : 'span'"
          v-for="(item, index) in visiblePages"
          :key="index"
          :type="item > 0 && page !== item ? 'button' : null"
          :class="[
            'vc-pagination__page',
            {
              'vc-pagination__page--active': item && page === item,
              'vc-pagination__page--ellipsis': !item,
            },
          ]"
          @click="setPage(item)"
        >
          {{ item || "..." }}
        </component>
      </div>

      <div class="vc-pagination__nav">
        <VcButton
          ref="prevButtonRef"
          class="vc-pagination__button vc-pagination__button--prev"
          color="secondary"
          variant="soft"
          size="sm"
          :disabled="page === 1"
          no-wrap
          :icon="compact"
          :aria-label="$t('ui_kit.pagination.previous')"
          @click="setPage(page - 1)"
        >
          <VcIcon name="chevron-left" />

          <span v-if="!compact">{{ $t("ui_kit.pagination.previous") }}</span>
        </VcButton>

        <VcButton
          ref="nextButtonRef"
          class="vc-pagination__button vc-pagination__button--next"
          color="secondary"
          variant="soft"
          size="sm"
          :disabled="page === pages"
          no-wrap
          :icon="compact"
          :aria-label="$t('ui_kit.pagination.next')"
          @click="setPage(page + 1)"
        >
          <span v-if="!compact">{{ $t("ui_kit.pagination.next") }}</span>

          <VcIcon name="chevron-right" />
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementBounding } from "@vueuse/core";
import { computed, ref } from "vue";

interface IEmits {
  (event: "update:page", page: number): void;
}

interface IProps {
  page?: number;
  pages?: number;
  scrollTarget?: HTMLElement;
  scrollOffset?: number;
  compact?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  page: 1,
  pages: 0,
  scrollOffset: 20,
});

const paginationRef = ref<HTMLDivElement | null>(null);
const pagesRef = ref<HTMLDivElement | null>(null);
const prevButtonRef = ref<HTMLButtonElement | null>(null);
const nextButtonRef = ref<HTMLButtonElement | null>(null);

const { width: paginationWidth } = useElementBounding(paginationRef);
const { width: pagesWidth } = useElementBounding(pagesRef);
const { width: prevButtonWidth } = useElementBounding(prevButtonRef);
const { width: nextButtonWidth } = useElementBounding(nextButtonRef);

const isWrapped = computed(() => {
  return paginationWidth.value < pagesWidth.value + prevButtonWidth.value + nextButtonWidth.value;
});

const visiblePages = computed(() => {
  if (props.pages <= 9) {
    return Array.from({ length: props.pages }, (_, i) => i + 1);
  }

  const pages = [];

  if (props.page <= 5) {
    for (let i = 1; i <= 7; i++) {
      pages.push(i);
    }

    pages.push(NaN);
    pages.push(props.pages);
  } else if (props.page >= props.pages - 4) {
    pages.push(1);
    pages.push(NaN);

    for (let i = props.pages - 6; i <= props.pages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    pages.push(NaN);

    for (let i = props.page - 2; i <= props.page + 2; i++) {
      pages.push(i);
    }

    pages.push(NaN);
    pages.push(props.pages);
  }

  return pages;
});

function scrollToTop() {
  if (props.scrollTarget) {
    const topPosition = props.scrollTarget.getBoundingClientRect().top + window.scrollY - props.scrollOffset;
    window.scrollTo({ top: topPosition, behavior: "smooth" });
  }
}

const setPage = (page: number) => {
  if (page) {
    emit("update:page", page);

    scrollToTop();
  }
};
</script>

<style lang="scss">
.vc-pagination {
  $self: &;
  $compact: "";
  $wrapped: "";

  // Override the two knobs as a pair: the ink default follows the palette and flips in dark.
  --page-active-bg: var(--vc-pagination-page-active-bg, theme("colors.primary.500"));
  --page-active-text: var(--vc-pagination-page-active-text, theme("colors.additional.50"));

  @apply flex max-w-full;

  &--compact {
    $compact: &;
  }

  &--wrapped {
    $wrapped: &;
  }

  &__container {
    @apply flex items-center gap-x-3 gap-y-1.5;

    #{$wrapped} & {
      @apply flex-wrap justify-center;
    }
  }

  &__pages {
    // The numbers are round controls, not a strip: without a gap two circles meet and read as one
    // capsule with a rule through it. 8 is the step the design gives this row.
    @apply order-2 flex justify-center gap-2;

    #{$wrapped} & {
      @apply flex-wrap;
    }
  }

  &__page {
    // A pager is a row of controls, so the number takes the same full radius the arrows beside it
    // already have — those are VcButtons and were rounded with everything else, while this one kept
    // a hardcoded 4px and left two different arcs in one row. `min-width` equals the height, so a
    // one- or two-digit page draws a true circle and "100" stretches to a pill rather than a box.
    --radius: var(--vc-pagination-page-radius, 9999px);
    --border: var(--vc-pagination-page-border-color, theme("colors.neutral.200"));
    --hover-border: var(--vc-pagination-page-hover-border-color, theme("colors.primary.200"));

    @apply flex items-center justify-center min-w-[2rem] h-8 p-1 text-xs font-bold;

    border-radius: var(--radius);

    // The ring is drawn even when the page is not the current one: white on a white plate read as a
    // bare digit, and the row did not look like a row of round controls at all.
    &[type="button"] {
      @apply bg-additional-50 text-neutral-950;

      border: 1px solid var(--border);
    }

    &:focus-visible {
      position: relative;
      z-index: 1;
    }

    &:hover {
      @apply bg-primary-50;

      border-color: var(--hover-border);
    }

    &--active {
      @apply pointer-events-none;

      background-color: var(--page-active-bg);
      color: var(--page-active-text);
      border: 1px solid var(--page-active-bg);
    }

    &--ellipsis {
      @apply pointer-events-none;

      border: 0;
    }
  }

  &__nav {
    @apply contents;

    #{$wrapped} & {
      @apply order-last flex flex-wrap gap-3;
    }
  }

  &__button {
    #{$self}:not(#{$compact}) & {
      @apply min-w-[6.5rem];
    }

    &--prev {
      @apply order-1;
    }

    &--next {
      @apply order-3;
    }
  }
}
</style>
