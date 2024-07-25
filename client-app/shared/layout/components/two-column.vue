<template>
  <div class="polygon-bg grow">
    <div class="container mx-auto px-7 pb-52 pt-5" :class="$attrs.class">
      <div :class="[{ 'lg:flex-row': alwaysShowRight, 'flex-col': alwaysShowRight }, 'flex', 'gap-[5.625rem]']">
        <div class="w-full lg:mt-8 lg:w-1/2">
          <slot name="left"></slot>
        </div>
        <slot></slot>
        <div :class="[{ hidden: !alwaysShowRight, 'lg:block': !alwaysShowRight }, 'w-full', 'lg:w-1/2']">
          <slot name="right"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

defineProps<IProps>();
interface IProps {
  alwaysShowRight?: boolean;
}
</script>
