<template>
  <Error404 v-if="isGone" />

  <output v-else class="plugin-route-placeholder" aria-busy="true">
    <VcLoader />
  </output>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { PLACEHOLDER_META_KEY } from "./declare";
import { whenPluginSettled } from "./status";
import type { Component } from "vue";

const NOT_FOUND_ROUTE = "NotFound";

const route = useRoute();
const router = useRouter();

// The host's own 404, read off its route: core does not import pages/.
const Error404 = defineAsyncComponent(async () => {
  const page = router.resolve({ name: NOT_FOUND_ROUTE }).matched.at(-1)?.components?.default;
  return (typeof page === "function" ? await (page as () => Promise<Component>)() : page) as Component;
});
const isGone = ref(false);
let run = 0;

// Once the plugin settles, re-resolve the URL: the plugin's own route, or the host's 404. Per URL, not
// per mount: RouterView reuses this instance when the user moves between two placeholders.
watch(
  () => route.fullPath,
  async () => {
    const current = ++run;
    isGone.value = false;
    const plugin = route.meta[PLACEHOLDER_META_KEY];
    if (typeof plugin !== "string") {
      isGone.value = true;
      return;
    }
    const { fullPath, name, path, query, hash } = route;
    await whenPluginSettled(plugin);
    if (current !== run || router.currentRoute.value.fullPath !== fullPath) {
      return;
    }
    const next = router.resolve(fullPath);
    if (next.name === name && next.matched.at(-1)?.meta[PLACEHOLDER_META_KEY] === undefined) {
      await router.replace({ path, query, hash, force: true });
      return;
    }
    isGone.value = true;
  },
  { immediate: true },
);
</script>

<style lang="scss">
.plugin-route-placeholder {
  @apply flex min-h-64 items-center justify-center;
}
</style>
