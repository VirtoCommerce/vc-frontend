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

/**
 * Whether the list, as the scrollbar last read it, wants another page.
 *
 * Read only at the moment of a measurement — see the watcher below. Every input except the
 * geometry is consumer-driven and can change while the published edges describe a box that no
 * longer exists, because the measurement runs behind a debounce: a handler appends rows and drops
 * `loading` in the same tick, and a decision taken then reads the geometry from before the append,
 * which still says "at the bottom". That is a second page nobody asked for.
 *
 * `loading` is therefore a guard and not a trigger. It covers the one way the edge is genuinely
 * re-reached while a request is in flight — the user scrolls up and comes back — and it is what
 * the spinner reports.
 */
const wantsMore = computed(
  () => props.hasNextPage && !props.loading && !props.pageLimitReached && scrollbar?.isAtBottom.value === true,
);

const showSpinner = computed(() => props.loading && props.hasNextPage);

const showEnd = computed(() => props.showEndOfList && !props.hasNextPage && !props.loading);

/**
 * How much the region holds, as a plain node count.
 *
 * Only ever read at rest — nothing is asked for while `loading` — so a spinner or a placeholder
 * row drawn in reply to the last request is absent from both readings, and the number moves only
 * for content that stayed.
 */
function readContentSize(): number {
  return scrollbar?.el.value?.getElementsByTagName("*").length ?? 0;
}

/** What the region held when the last page was asked for; null until something has been asked. */
const askedAt = ref<number | null>(null);

/**
 * Decided on a reading of the box, never on a prop transition, and asked again only once the last
 * request has been answered with something.
 *
 * A list that still fits its viewport has to be asked about again — nothing will ever scroll it —
 * and the page that landed is what re-opens the question. A request that brings nothing back does
 * not: a failed fetch, or a backend still claiming a next page it will not serve, leaves the
 * region exactly as it was and is not repeated. Neither is recoverable from in here, so the
 * consumer owns saying so; asking again forever is not saying it.
 */
function reconsider(): void {
  if (!wantsMore.value) {
    return;
  }

  const size = readContentSize();

  if (size === askedAt.value) {
    return;
  }

  askedAt.value = size;
  emit("loadMore");
}

// A list that ran out and was rebuilt — a new search, a reopened popup — counts from scratch, or
// its first page would be skipped whenever the old list happened to end at the same size.
watch(
  () => props.hasNextPage,
  (hasNextPage) => {
    if (!hasNextPage) {
      askedAt.value = null;
    }
  },
);

watch(() => scrollbar?.measuredAt.value, reconsider);

// A list already resting at its bottom when this component appears — a popover opening onto a
// short first page, a `v-if` flipping — has been measured already, and no further measurement is
// coming, so the first request has to be asked for outright.
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
