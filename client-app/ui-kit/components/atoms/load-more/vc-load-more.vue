<template>
  <component :is="tag" v-if="showSpinner" class="vc-load-more" :data-test-id="testId" :role="role">
    <slot name="loading">
      <VcLoader />

      <span class="sr-only">{{ $t("ui_kit.messages.loading_text") }}</span>
    </slot>
  </component>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from "vue";
import { vcScrollbarKey } from "../scrollbar/vc-scrollbar-context";

interface IEmits {
  (event: "loadMore"): void;
}

interface IProps {
  /** Another page exists. Nothing is ever requested without it. */
  hasNextPage?: boolean;
  /** A page is on its way: blocks a second request and shows the spinner, so a paged list has to bind it. */
  loading?: boolean;
  /**
   * How many items the list has loaded: a request is answered once the count grows, and a list
   * rebuilt for a new search is told by the count dropping. The loaded items, not the rendered rows,
   * which a filter may hide.
   */
  itemCount: number;
  tag?: string;
  testId?: string;
  role?: string;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  tag: "div",
  role: "status",
});

const scrollbar = inject(vcScrollbarKey, null);

if (import.meta.env.DEV && !scrollbar && props.hasNextPage) {
  // eslint-disable-next-line no-console
  console.warn("VcLoadMore: no VcScrollbar around it, so nothing can tell it the list reached its end.");
}

// Read only when a measurement lands (the watcher below): the edges come from a debounced
// measurement, so reacting to props would read the box from before an append and ask twice.
// `loading` is a guard, not a trigger.
const wantsMore = computed(() => props.hasNextPage && !props.loading && scrollbar?.isAtBottom.value === true);

const showSpinner = computed(() => props.loading && props.hasNextPage);

type ContentType = { size: number; text: string };

// `size` is the progress measure; the text tells a list rebuilt to the same size.
function readContent(): ContentType {
  return { size: props.itemCount, text: scrollbar?.el.value?.textContent ?? "" };
}

/** What the region held when the last page was asked for; null until something has been asked. */
const askedAt = ref<ContentType | null>(null);

/**
 * Asks again only once the last request changed what the list holds. A short list is never
 * scrolled, so the landed page is what re-opens the question; a failed fetch leaves the list as
 * it was and is not repeated — the consumer recovers by changing `items` or `has-next-page`.
 */
function reconsider(): void {
  const content = readContent();

  // Content that shrank or no longer starts with what was asked from is a rebuilt list (a new search).
  // Rows swapped while a page loads (an empty state giving way to the spinner) are not a rebuild: the
  // count watcher below sees a real one at any time. A list scrolled away from its end is asked again
  // once it is back, so a page that failed is retried by the user's own scroll, never by a loop.
  if (
    askedAt.value &&
    !props.loading &&
    (content.size < askedAt.value.size ||
      !content.text.startsWith(askedAt.value.text) ||
      scrollbar?.isAtBottom.value === false)
  ) {
    askedAt.value = null;
  }

  if (!wantsMore.value || content.size === askedAt.value?.size) {
    return;
  }

  askedAt.value = content;
  emit("loadMore");
}

// A count that drops below the one asked from is a list emptied for a new search, even when the
// answer brings back exactly the rows asked from before.
watch(
  () => props.itemCount,
  (count) => {
    if (askedAt.value && count < askedAt.value.size) {
      askedAt.value = null;
    }
  },
);

// A list that ran out and was rebuilt counts from scratch. A next page that appears on a list already
// at rest gets no measurement of its own, so it is reconsidered here.
watch(
  () => props.hasNextPage,
  (hasNextPage) => {
    if (!hasNextPage) {
      askedAt.value = null;
      return;
    }

    reconsider();
  },
);

watch(() => scrollbar?.measuredAt.value, reconsider);

// A list already at rest at its bottom on mount gets no further measurement.
onMounted(reconsider);
</script>

<style lang="scss">
.vc-load-more {
  @apply flex items-center justify-center gap-2 p-2 text-base;
}
</style>
