<template>
  <!-- Mounted ahead of its content: a live region inserted together with its text may go unannounced. -->
  <component
    :is="tag"
    v-if="hasNextPage"
    :class="['vc-load-more', { 'vc-load-more--loading': showSpinner }]"
    :data-test-id="testId"
    :role="role"
  >
    <slot v-if="showSpinner" name="loading">
      <VcLoader />

      <span class="sr-only">{{ $t("ui_kit.messages.loading_text") }}</span>
    </slot>
  </component>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, onMounted, ref, watch } from "vue";
import { isCollapsedBox, vcScrollbarKey } from "../scrollbar/vc-scrollbar-context";

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
   * which a filter may hide. A page that fails is not asked for again while the list rests at its end;
   * scrolling away and back retries it, and a list too short to scroll is retried by the consumer.
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

if (import.meta.env.DEV) {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {};

  if (("has-next-page" in vnodeProps || "hasNextPage" in vnodeProps) && !("loading" in vnodeProps)) {
    // eslint-disable-next-line no-console
    console.warn("VcLoadMore: `has-next-page` needs `loading` bound, or a page still loading is asked for again.");
  }
}

// Read when a measurement lands, a next page appears, or on mount, never on `loading`: the edges come
// from a debounced measurement, so reacting to `loading` would read the box from before an append.
const wantsMore = computed(() => props.hasNextPage && !props.loading && scrollbar?.isAtBottom.value === true);

const showSpinner = computed(() => props.loading && props.hasNextPage);

type ContentType = { size: number; text: string };

// `size` is the progress measure; the text tells a list rebuilt to the same size.
function readContent(): ContentType {
  return { size: props.itemCount, text: scrollbar?.el.value?.textContent ?? "" };
}

/**
 * What the region held when the last page was asked for; null until asked, and again once the list is
 * rebuilt, left or runs out.
 */
const askedAt = ref<ContentType | null>(null);

/** Asks once per list content. */
function reconsider(): void {
  const content = readContent();

  // Shrunk, re-prefixed or left: ask afresh. Not while loading: a row swapped for the spinner is no rebuild.
  if (
    askedAt.value &&
    !props.loading &&
    (content.size < askedAt.value.size ||
      !content.text.startsWith(askedAt.value.text) ||
      scrollbar?.isAtBottom.value === false)
  ) {
    askedAt.value = null;
  }

  // A collapsed region (a closed dropdown) keeps the edges of its last measurement; it asks for nothing.
  if (
    !wantsMore.value ||
    content.size === askedAt.value?.size ||
    !scrollbar?.el.value ||
    isCollapsedBox(scrollbar.el.value)
  ) {
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
  &--loading {
    @apply flex items-center justify-center gap-2 p-2 text-base;
  }
}
</style>
