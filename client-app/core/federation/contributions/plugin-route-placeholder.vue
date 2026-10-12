<template>
  <Error404 v-if="state === 'gone'" />

  <output v-else class="plugin-route-placeholder" data-test-id="plugin-route-placeholder-section">
    <VcLoader v-if="state !== 'failed'" />

    <!-- Filled in after mount: a live region that arrives with its text already in it is not announced. -->
    <span v-if="isMounted && state === 'loading'" class="plugin-route-placeholder__label">
      {{ $t("common.messages.page_loading") }}
    </span>

    <template v-else-if="isMounted">
      <span class="plugin-route-placeholder__notice">
        {{ state === "slow" ? $t("common.messages.page_loading_slow") : $t("common.messages.content_failed_to_load") }}
      </span>

      <VcButton size="sm" variant="outline" data-test-id="plugin-route-placeholder-reload-button" @click="reloadPage">{{
        $t("common.buttons.reload_page")
      }}</VcButton>
    </template>
  </output>
</template>

<script setup lang="ts">
import { useMounted, useTimeoutFn } from "@vueuse/core";
import { defineAsyncComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { PLACEHOLDER_META_KEY, PLACEHOLDER_SLOW_NOTICE_MS } from "./placeholder";
import { whenPluginFinal } from "./status";
import type { Component } from "vue";

type PlaceholderStateType = "loading" | "slow" | "failed" | "gone";

const NOT_FOUND_ROUTE = "NotFound";

const route = useRoute();
const router = useRouter();

// The host's own 404, read off its route: core does not import pages/.
const Error404 = defineAsyncComponent(async () => {
  const page = router.resolve({ name: NOT_FOUND_ROUTE }).matched.at(-1)?.components?.default;
  return (typeof page === "function" ? await (page as () => Promise<Component>)() : page) as Component;
});
const state = ref<PlaceholderStateType>("loading");
const isMounted = useMounted();
const slowNotice = useTimeoutFn(
  () => {
    if (state.value === "loading") {
      state.value = "slow";
    }
  },
  PLACEHOLDER_SLOW_NOTICE_MS,
  { immediate: false },
);
let run = 0;

// Once the plugin reaches a final state, re-resolve the URL: the plugin's own route, a reload offer if
// it failed, or the host's 404 if it was skipped. Per URL, not per mount: RouterView reuses this
// instance when the user moves between two placeholders.
watch(
  () => route.fullPath,
  async () => {
    const current = ++run;
    state.value = "loading";
    slowNotice.stop();
    const plugin = route.meta[PLACEHOLDER_META_KEY];
    if (typeof plugin !== "string") {
      state.value = "gone";
      return;
    }
    slowNotice.start();
    const { fullPath, name, path, query, hash } = route;
    const status = await whenPluginFinal(plugin);
    if (current !== run || router.currentRoute.value.fullPath !== fullPath) {
      return;
    }
    slowNotice.stop();
    if (status.state === "failed") {
      state.value = "failed";
      return;
    }
    const next = router.resolve(fullPath);
    if (next.name === name && next.matched.at(-1)?.meta[PLACEHOLDER_META_KEY] === undefined) {
      await router.replace({ path, query, hash, force: true });
      return;
    }
    state.value = "gone";
  },
  { immediate: true },
);

function reloadPage(): void {
  location.reload();
}
</script>

<style lang="scss">
.plugin-route-placeholder {
  @apply flex min-h-64 flex-col items-center justify-center gap-4 text-center;

  &__label {
    @apply sr-only;
  }

  &__notice {
    @apply max-w-md text-sm text-neutral-600;
  }
}
</style>
