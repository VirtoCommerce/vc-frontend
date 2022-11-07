<template>
  <!-- Loader Overlay -->
  <transition name="fade" appear>
    <span
      v-if="visible"
      v-bind="$attrs"
      :class="[
        'absolute inset-0 flex items-center justify-center z-[var(--loader-overlay-z-index,9999)]',
        { 'bg-[color:var(--loader-overlay-bg,rgba(255,255,255,0.6))]': !noBg },
      ]"
    >
      <VcLoader
        :class="[
          'inline-block text-[color:var(--loader-overlay-color,_var(--color-primary))]',
          { fixed: fixedRunner },
          runnerClasses,
        ]"
      />
    </span>
  </transition>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
defineProps({
  fixedRunner: Boolean,
  noBg: Boolean,

  visible: {
    type: Boolean,
    default: true,
  },

  runnerClasses: {
    type: String,
    default: "h-6 w-6",
  },
});
</script>
