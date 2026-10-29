<template>
  <div class="vc-shape" :style="style">
    <slot>
      <VcIcon v-if="icon" :name="icon" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getImageUrl, getIconUrl, getColorValue } from "../../../utilities";

interface IProps {
  size?: string;
  icon?: string;
  iconColor?: string;
  bgColor?: string;
  img?: string;
  /** An icon name used as the mask. Without it the shape takes `--vc-shape-mask-image`, a polygon by default. */
  mask?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  img: "",
});

const imgUrl = computed(() => getImageUrl(props.img));

const style = computed(() => ({
  backgroundImage: props.img ? `url("${imgUrl.value}")` : "none",
  maskImage: props.mask ? `url("${getIconUrl(props.mask)}")` : undefined,
}));

const _bgColor = computed(() => getColorValue(props.bgColor));
const _iconColor = computed(() => getColorValue(props.iconColor));
</script>

<style lang="scss">
.vc-shape {
  --props-size: v-bind(props.size);
  --props-bg-color: v-bind(_bgColor);
  --props-icon-color: v-bind(_iconColor);

  --size: var(--props-size, var(--vc-shape-size, 2.5rem));
  --bg-color: var(--props-bg-color, var(--vc-shape-bg-color, theme("colors.secondary.500")));
  --radius: var(--vc-shape-radius, 0);

  --vc-icon-color: var(--props-icon-color, var(--vc-shape-color, theme("colors.additional.50")));
  --vc-icon-size: 50%;

  @apply relative flex items-center justify-center size-[--size] bg-[--bg-color] bg-cover bg-center rounded-[--radius];

  mask-image: var(--vc-shape-mask-image, url("../../../icons/solid/polygon.svg"));
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}
</style>
