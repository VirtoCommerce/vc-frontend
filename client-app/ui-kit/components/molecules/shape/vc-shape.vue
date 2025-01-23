<template>
  <div class="vc-shape" :style="style">
    <slot>
      <VcIcon v-if="icon" :name="icon" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { isCssVariable, getImageUrl, getIconUrl } from "@/ui-kit/utilities";

interface IProps {
  size?: string;
  icon?: string;
  iconColor?: string;
  bgColor?: string;
  img?: string;
  mask?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  mask: "polygon",
  size: "",
  iconColor: "",
  bgColor: "",
  img: "",
});

const iconUrl = computed(() => getIconUrl(props.mask));
const imgUrl = computed(() => getImageUrl(props.img));

const style = computed(() => ({
  backgroundImage: props.img ? `url("${imgUrl.value}")` : "none",
  maskImage: iconUrl.value ? `url("${iconUrl.value}")` : "none",
}));

const _bgColor = computed(() => (isCssVariable(props.bgColor) ? `var(${props.bgColor})` : props.bgColor));
const _iconColor = computed(() => (isCssVariable(props.iconColor) ? `var(${props.iconColor})` : props.iconColor));
</script>

<style lang="scss">
.vc-shape {
  --props-size: v-bind(props.size);
  --props-bg-color: v-bind(_bgColor);
  --props-icon-color: v-bind(_iconColor);

  --size: var(--props-size, var(--vc-shape-size, 2.5rem));
  --bg-color: var(--props-bg-color, var(--vc-shape-bg-color, theme("colors.secondary.500")));

  --vc-icon-color: var(--props-icon-color, var(--vc-shape-color, theme("colors.additional.50")));
  --vc-icon-size: 50%;

  @apply relative flex items-center justify-center size-[--size] bg-[--bg-color] bg-cover bg-center;

  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}
</style>
