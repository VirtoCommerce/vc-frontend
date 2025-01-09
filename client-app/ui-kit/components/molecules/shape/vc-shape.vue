<template>
  <div class="vc-shape" :style="style">
    <slot>
      <VcIcon v-if="icon" :name="icon" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getImageUrl, getIconUrl } from "@/ui-kit/utilities";

interface IProps {
  size?: number | string;
  icon?: string;
  img?: string;
  mask?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "2.5rem",
  mask: "polygon",
  img: "",
});

const iconUrl = computed(() => getIconUrl(props.mask));
const imgUrl = computed(() => getImageUrl(props.img));

const _size = computed(() => (typeof props.size === "number" ? `${props.size}px` : props.size));

const style = computed(() => ({
  width: _size.value,
  height: _size.value,
  backgroundImage: props.img ? `url("${imgUrl.value}")` : "none",
  maskImage: iconUrl.value ? `url("${iconUrl.value}")` : "none",
}));
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
