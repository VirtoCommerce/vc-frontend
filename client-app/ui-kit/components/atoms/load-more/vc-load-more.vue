<template>
  <component
    :is="tag"
    v-if="pageLimitReached || showSpinner || showEnd"
    class="vc-load-more"
    :data-test-id="testId"
    :role="role"
  >
    <slot v-if="pageLimitReached" name="limit">
      <VcIcon class="vc-load-more__icon" name="badge-check" />

      <span>{{ $t("ui_kit.reach_limit.page_limit_filters") }}</span>
    </slot>

    <slot v-else-if="showSpinner" name="loading">
      <VcLoader />

      <span class="sr-only">{{ $t("ui_kit.messages.loading_text") }}</span>
    </slot>

    <slot v-else name="end">
      <VcIcon class="vc-load-more__icon" name="badge-check" />

      <span>{{ $t("ui_kit.reach_limit.end_list") }}</span>
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
  /**
   * A page is on its way. It is what keeps one request from becoming many — see the note on
   * `reconsider` — and it is what the spinner reports, so a paged list has to bind it.
   */
  loading?: boolean;
  /**
   * Say "you have reached the end of the list" once no next page is left. Off by default: the
   * sentence is addressed to someone who scrolled a page-sized list to its end, and a dropdown of
   * options does not want it under four items.
   */
  showEndOfList?: boolean;
  /**
   * Paging stopped short of the end because the backend will not serve past this page — the
   * catalog's search window. Takes over from both other states: nothing more is coming, so there
   * is no spinner, and the message says the results were cut rather than exhausted.
   */
  pageLimitReached?: boolean;
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
const wantsMore = computed(
  () => props.hasNextPage && !props.loading && !props.pageLimitReached && scrollbar?.isAtBottom.value === true,
);

const showSpinner = computed(() => props.loading && props.hasNextPage);

const showEnd = computed(() => props.showEndOfList && !props.hasNextPage && !props.loading);

// What the region shows, read only at rest, so a spinner drawn for the last request is never in it.
// Text rather than a node count: a new search can land exactly as many rows as the list it replaced.
function readContent(): string {
  return scrollbar?.el.value?.textContent ?? "";
}

/** What the region showed when the last page was asked for; null until something has been asked. */
const askedAt = ref<string | null>(null);

/**
 * Asks again only once the last request changed what the list shows. A short list is never
 * scrolled, so the landed page is what re-opens the question; a failed fetch leaves the list as
 * it was and is not repeated — the consumer recovers by changing `items` or `has-next-page`.
 */
function reconsider(): void {
  if (!wantsMore.value) {
    return;
  }

  const content = readContent();

  if (content === askedAt.value) {
    return;
  }

  askedAt.value = content;
  emit("loadMore");
}

// A list that ran out and was rebuilt counts from scratch.
watch(
  () => props.hasNextPage,
  (hasNextPage) => {
    if (!hasNextPage) {
      askedAt.value = null;
    }
  },
);

watch(() => scrollbar?.measuredAt.value, reconsider);

// A list already at rest at its bottom on mount gets no further measurement.
onMounted(reconsider);
</script>

<style lang="scss">
.vc-load-more {
  @apply flex items-center justify-center gap-2 p-2 text-base;

  &__icon {
    @apply size-7 text-primary;
  }
}
</style>
