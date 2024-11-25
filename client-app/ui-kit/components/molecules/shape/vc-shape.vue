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
  size?: number | string;
  icon?: string;
  img?: string;
  mask?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "2.5rem",
  mask: "polygon",
});

const iconUrl = ref<string>("");

const loadIcon = async (name?: string) => {
  const module = (await import(`@/assets/icons/basic/${name}.svg?url`)) as { default: string };
  iconUrl.value = module.default || "";
};

const _size = computed(() => (typeof props.size === "number" ? `${props.size}px` : props.size));

const style = computed(() => ({
  width: _size.value,
  height: _size.value,
  backgroundImage: props.img ? `url(${props.img})` : "none",
  maskImage: iconUrl.value && iconUrl.value !== "null" ? `url(${iconUrl.value})` : "none",
}));

watch(
  () => props.mask,
  (newIconName: string) => {
    void loadIcon(newIconName);
  },
  { immediate: true },
);
</script>

<style lang="scss">
.vc-shape {
  --size: var(--vc-shape-icon-size, 2.5rem);
  --bg-color: var(--vc-shape-icon-bg-color, theme("colors.secondary.500"));
  --vc-icon-color: var(--vc-shape-icon-color, theme("colors.additional.50"));
  --vc-icon-size: 50%;

  @apply relative flex items-center justify-center size-[--size] bg-[--bg-color] bg-cover bg-center;

  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}
</style>
