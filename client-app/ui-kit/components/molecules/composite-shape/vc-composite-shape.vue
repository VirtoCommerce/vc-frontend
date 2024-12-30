<template>
  <div class="vc-composite-shape">
    <div class="vc-composite-shape__image">
      <slot name="image">
        <VcShape :img="img" :mask="mask" :size="size" />
      </slot>
    </div>

    <div class="vc-composite-shape__icon">
      <slot>
        <VcShape :icon="icon" :mask="iconMask" :size="iconSize" :bg-color="iconBgColor" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  icon?: string;
  iconMask?: string;
  iconSize?: string;
  iconBgColor?: string;
  img?: string;
  mask?: string;
  size?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "",
  iconSize: "",
  iconBgColor: "",
});
</script>

<style lang="scss">
.vc-composite-shape {
  --props-size: v-bind(props.size);
  --props-icon-size: v-bind(props.iconSize);

  --size: var(--props-size, var(--vc-composite-shape-size, 15rem));
  --icon-size: var(--props-icon-size, var(--vc-composite-shape-icon-size, 26.5%));
  --icon-top: var(--vc-composite-shape-icon-top, 11%);
  --icon-left: var(--vc-composite-shape-icon-left, -8%);

  @apply relative size-[--size];

  &__image {
    --vc-shape-size: var(--size);

    @apply size-full;
  }

  &__icon {
    --vc-shape-size: 100%;

    @apply absolute top-[--icon-top] left-[--icon-left] size-[--icon-size];
  }
}
</style>
