<template>
  <VcButton class="section-link" :to="to" size="sm" color="secondary" variant="outline" append-icon="arrow-right">
    <slot />
  </VcButton>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  to: RouteLocationRaw;
}

defineProps<IProps>();
</script>

<style lang="scss">
.section-link {
  // One step lighter than the kit's outline default: 500 is cut for a button that carries the
  // page's action, and beside a section heading it reads as a second call to action next to the
  // heading itself. The design draws this hairline at 400.
  //
  // The button's own token, NOT the shared `--color-vc-border-outline-secondary` key: that key is
  // read inside a `:root` declaration, so a var() put on this element is never seen there. Dark is
  // left alone on purpose — assets/styles/dark/molecules/vc-button.scss writes `--border-color`
  // itself and never reads this token, and the dark ramp's 400 is a deep brown that would drop the
  // hairline to about 2:1 on the plate.
  --vc-button-outline-secondary-border: theme("colors.secondary.400");
}
</style>
