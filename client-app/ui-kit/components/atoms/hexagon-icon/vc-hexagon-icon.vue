<template>
  <span class="vc-hexagon-icon" :style="style">
    <VcIcon v-if="icon" :name="icon" />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  size?: number | string;
  icon?: string;
  img?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "2.5rem",
});

const _size = computed(() => (typeof props.size === "number" ? `${props.size}px` : props.size));

const style = computed(() => ({
  width: _size.value,
  height: _size.value,
  backgroundImage: props.img ? `url(${props.img})` : "none",
}));
</script>

<style lang="scss">
.vc-hexagon-icon {
  --size: var(--vc-hexagon-icon-size, 2.5rem);
  --bg-color: var(--vc-hexagon-icon-bg-color, theme("colors.secondary.500"));
  --vc-icon-color: var(--vc-hexagon-icon-color, theme("colors.additional.50"));
  --vc-icon-size: 50%;

  @apply relative flex items-center justify-center size-[--size] bg-[--bg-color] bg-cover bg-center;

  mask: url("/static/icons/polygon.svg");
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}
</style>
