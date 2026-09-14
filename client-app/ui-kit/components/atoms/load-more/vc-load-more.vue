<template>
  <component :is="tag" v-if="pageLimitReached || showSpinner || showEnd" class="vc-load-more" :data-test-id="testId">
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
import { computed, inject, onMounted, watch } from "vue";
import { vcScrollbarKey } from "../scrollbar/vc-scrollbar-context";

interface IEmits {
  (event: "loadMore"): void;
}

interface IProps {
  /** Another page exists. Nothing is ever requested without it. */
  hasNextPage?: boolean;
  /**
   * A page is on its way. It is what keeps one request from becoming many — see the note on
   * `shouldRequest` — and it is what the spinner reports, so a paged list has to bind it.
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
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  tag: "div",
});

const scrollbar = inject(vcScrollbarKey, null);

if (import.meta.env.DEV && !scrollbar && props.hasNextPage) {
  // eslint-disable-next-line no-console
  console.warn("VcLoadMore: no VcScrollbar around it, so nothing can tell it the list reached its end.");
}

/**
 * The scrollbar reports where the list rests; these props are what make that reportable state
 * decidable, and they live here because only the consumer holds them.
 *
 * Requests are transitions of this value, not states of it, which is what keeps an answer from
 * provoking another question: a handler replies by drawing something — a spinner, placeholder
 * rows — and the list is still resting at its bottom afterwards, so the value never left `true`
 * and nothing fires.
 *
 * `loading` then does two things that the geometry alone cannot. It covers the one way the edge is
 * genuinely re-reached while a request is in flight — the user scrolls up and comes back — and,
 * falling back to false, it re-opens the question once the page has landed, so a list that still
 * fits its viewport asks for the page after it instead of stopping. That second half is why paging
 * cannot be decided inside VcScrollbar: only the consumer knows a page arrived.
 */
const shouldRequest = computed(
  () => props.hasNextPage && !props.loading && !props.pageLimitReached && scrollbar?.isAtBottom.value === true,
);

const showSpinner = computed(() => props.loading && props.hasNextPage);

const showEnd = computed(() => props.showEndOfList && !props.hasNextPage && !props.loading);

watch(shouldRequest, (value) => {
  if (value) {
    emit("loadMore");
  }
});

// A list already resting at its bottom when this component appears — a popover opening onto a
// short first page, a `v-if` flipping — produces no change for the watcher above, so the first
// request has to be asked for outright.
onMounted(() => {
  if (shouldRequest.value) {
    emit("loadMore");
  }
});
</script>

<style lang="scss">
.vc-load-more {
  @apply flex items-center justify-center gap-2 p-2 text-base;

  &__icon {
    @apply size-7 text-primary;
  }
}
</style>
