<template>
  <div class="vc-shape" :style="style">
    <slot>
      <VcIcon v-if="icon" :name="icon" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface IProps {
  size?: string;
  icon?: string;
  img?: string;
  mask?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  mask: "polygon",
  size: "",
});

const iconUrl = ref<string>("");

const style = computed(() => ({
  backgroundImage: props.img ? `url("${props.img}")` : "none",
  maskImage: iconUrl.value ? `url("${iconUrl.value}")` : "none",
}));

function loadIcon(name?: string) {
  iconUrl.value = new URL(`/client-app/assets/icons/basic/${name}.svg`, import.meta.url).href ?? "";
}

watch(
  () => props.mask,
  (newIconName: string) => {
    loadIcon(newIconName);
  },
  { immediate: true },
);
</script>

<style lang="scss">
.vc-shape {
  --props-size: v-bind(props.size);

  --size: var(--props-size, var(--vc-shape-size, 2.5rem));
  --bg-color: var(--vc-shape-bg-color, theme("colors.secondary.500"));
  --vc-icon-color: var(--vc-shape-color, theme("colors.additional.50"));
  --vc-icon-size: 50%;

  @apply relative flex items-center justify-center size-[--size] bg-[--bg-color] bg-cover bg-center;

  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}
</style>
