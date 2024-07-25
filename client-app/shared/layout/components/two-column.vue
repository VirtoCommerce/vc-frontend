<template>
  <div class="polygon-bg grow">
    <div class="container mx-auto px-7 pb-52 pt-5" :class="$attrs.class">
      <div
        :class="[
          'flex',
          'gap-8',
          `${breakpoint}:gap-[5.625rem]`,
          {
            [`${breakpoint}:flex-row`]: alwaysShowRight,
            'flex-col': alwaysShowRight,
          },
        ]"
      >
        <div :class="`w-full ${breakpoint}:mt-8 ${breakpoint}:w-1/2`">
          <slot name="left"></slot>
        </div>
        <slot></slot>
        <div
          :class="[
            'w-full',
            `${breakpoint}:w-1/2`,
            { hidden: !alwaysShowRight, [`${breakpoint}:block`]: !alwaysShowRight },
          ]"
        >
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

withDefaults(defineProps<IProps>(), {
  breakpoint: "lg",
});
interface IProps {
  alwaysShowRight?: boolean;
  breakpoint?: string;
}
</script>
