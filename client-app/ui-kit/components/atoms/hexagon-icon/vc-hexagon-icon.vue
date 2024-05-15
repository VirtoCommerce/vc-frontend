<template>
  <span class="vc-hexagon-icon" :style="style">
    <VcIcon class="vc-hexagon-icon__icon" :name="icon" />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  size?: number | string;
  icon?: string;
}

const props = defineProps<IProps>();

const width = computed(() => (typeof props.size === "number" ? `${props.size}px` : props.size));
const style = computed(() => (props.size ? { width: width.value } : {}));
</script>

<style lang="scss">
.vc-hexagon-icon {
  --hexagon-size: var(--vc-hexagon-icon-size, 2.5rem);

  @apply flex items-center justify-center w-[--hexagon-size] bg-[--hexagon-icon-bg-color] text-[--hexagon-icon-color] aspect-square;

  clip-path: polygon(
    45% 1.33975%,
    46.5798% 0.60307%,
    48.26352% 0.15192%,
    50% 0%,
    51.73648% 0.15192%,
    53.4202% 0.60307%,
    55% 1.33975%,
    89.64102% 21.33975%,
    91.06889% 22.33956%,
    92.30146% 23.57212%,
    93.30127% 25%,
    94.03794% 26.5798%,
    94.48909% 28.26352%,
    94.64102% 30%,
    94.64102% 70%,
    94.48909% 71.73648%,
    94.03794% 73.4202%,
    93.30127% 75%,
    92.30146% 76.42788%,
    91.06889% 77.66044%,
    89.64102% 78.66025%,
    55% 98.66025%,
    53.4202% 99.39693%,
    51.73648% 99.84808%,
    50% 100%,
    48.26352% 99.84808%,
    46.5798% 99.39693%,
    45% 98.66025%,
    10.35898% 78.66025%,
    8.93111% 77.66044%,
    7.69854% 76.42788%,
    6.69873% 75%,
    5.96206% 73.4202%,
    5.51091% 71.73648%,
    5.35898% 70%,
    5.35898% 30%,
    5.51091% 28.26352%,
    5.96206% 26.5798%,
    6.69873% 25%,
    7.69854% 23.57212%,
    8.93111% 22.33956%,
    10.35898% 21.33975%
  );

  &__icon {
    @apply w-[62%] h-[62%] #{!important};
  }
}
</style>
