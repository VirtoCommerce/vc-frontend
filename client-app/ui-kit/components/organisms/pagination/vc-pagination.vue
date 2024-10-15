<template>
  <div
    v-if="pages > 1"
    :class="[
      'vc-pagination',
      {
        'vc-pagination--compact': compact,
      },
    ]"
  >
    <div class="vc-pagination__container">
      <div class="vc-pagination__pages">
        <component
          :is="item > 0 && page !== item ? 'button' : 'span'"
          v-for="(item, index) in visiblePages"
          :key="index"
          :type="item > 0 && page !== item ? 'button' : null"
          :class="[
            'vc-pagination__page',
            {
              'vc-pagination__page--active': item && page === item,
              'vc-pagination__page--ellipsis': item === 0,
            },
          ]"
          @click="setPage(item)"
        >
          {{ item || "..." }}
        </component>
      </div>

      <div class="vc-pagination__nav">
        <VcButton
          class="vc-pagination__button vc-pagination__button--prev"
          color="secondary"
          variant="outline"
          size="sm"
          :disabled="page === 1"
          @click="setPage(page - 1)"
        >
          <VcIcon name="chevron-left" />
          <span v-if="!compact">{{ $t("ui_kit.pagination.previous") }}</span>
        </VcButton>

        <VcButton
          class="vc-pagination__button vc-pagination__button--next"
          color="secondary"
          variant="outline"
          size="sm"
          :disabled="page === pages"
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
import { computed } from "vue";

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
  $compact: "";

  @apply @container;

  &--compact {
    $compact: &;
  }

  &__container {
    @apply flex min-w-fit flex-wrap justify-center items-center;

    #{$compact} & {
      @container (width > theme("containers.sm")) {
        @apply gap-3 justify-start;
      }
    }

    @container (width > theme("containers.xl")) {
      @apply gap-3 justify-start;
    }
  }

  &__pages {
    @apply flex justify-center w-full;

    #{$compact} & {
      @container (width > theme("containers.sm")) {
        @apply w-auto;
      }
    }

    @container (width > theme("containers.xl")) {
      @apply w-auto;
    }
  }

  &__page {
    @apply flex items-center justify-center min-w-[2rem] h-8 p-1 rounded text-xs font-bold;

    &[type="button"] {
      @apply bg-additional-50 text-neutral-950;
    }

    &:hover {
      @apply bg-primary-50;
    }

    &--active {
      @apply bg-primary text-additional-50 pointer-events-none;
    }

    &--ellipsis {
      @apply text-neutral-400 pointer-events-none;
    }
  }

  &__nav {
    @apply flex gap-8 justify-between mt-1.5;

    #{$compact} & {
      @container (width > theme("containers.sm")) {
        @apply contents;
      }
    }

    @container (width > theme("containers.xl")) {
      @apply contents;
    }
  }

  &__button {
    @apply min-w-[6.5rem];

    #{$compact} & {
      @apply min-w-min;
    }

    &--prev {
      @apply -order-1;
    }
  }
}
</style>
