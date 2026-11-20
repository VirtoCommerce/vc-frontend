<template>
  <!-- eslint-disable-next-line vue/no-v-html -- bundled SVG from ui-kit/images/empty-states, sanitized on load -->
  <span class="vc-empty-icon" :style="style" aria-hidden="true" v-html="svg" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { loadEmptyIconRaw } from "@/ui-kit/utilities";

interface IProps {
  name: VcEmptyIconNameType;
  /** Width and height: a number in px or any CSS length. Default 160px (the XL step). */
  size?: number | string;
}

const props = defineProps<IProps>();

const svg = ref("");

const style = computed(() => {
  const result: Record<string, string> = {};

  if (props.size !== undefined && props.size !== "") {
    result["--props-size"] = typeof props.size === "number" ? `${props.size}px` : props.size;
  }
  return result;
});

let latestLoadToken = 0;

async function load(name: VcEmptyIconNameType): Promise<void> {
  const token = ++latestLoadToken;
  const raw = await loadEmptyIconRaw(name);

  if (token === latestLoadToken) {
    svg.value = raw;
  }
}

watch(
  () => props.name,
  (name) => {
    void load(name);
  },
  { immediate: true },
);
</script>

<style lang="scss">
// Every colour inside a drawing is a palette variable. Parts that must not follow the inverted dark scales go
// through the --vc-empty-icon-* tokens: plate (the circle), shadow (the ground oval), light (lens glass, paper,
// highlights) and badge-success; their light values are the fallbacks inside the SVG files, dark values live in
// assets/styles/dark/atoms/vc-empty-icon.scss.
.vc-empty-icon {
  --size: var(--props-size, var(--vc-empty-icon-size, 10rem));

  @apply inline-block flex-none size-[--size] leading-none;

  svg {
    @apply block size-full;
  }
}
</style>
