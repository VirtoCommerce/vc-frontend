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
          ref="prevButtonRef"
          class="vc-pagination__button vc-pagination__button--prev"
          color="secondary"
          variant="solid-light"
          size="sm"
          :disabled="page === 1"
          no-wrap
          :icon="compact"
          @click="setPage(page - 1)"
        >
          <VcIcon name="chevron-left" />

          <span v-if="!compact">{{ $t("ui_kit.pagination.previous") }}</span>
        </VcButton>

        <VcButton
          ref="nextButtonRef"
          class="vc-pagination__button vc-pagination__button--next"
          color="secondary"
          variant="solid-light"
          size="sm"
          :disabled="page === pages"
          no-wrap
          :icon="compact"
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

  @apply flex;

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
    @apply order-2 flex justify-center;

    #{$wrapped} & {
      @apply flex-wrap;
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
