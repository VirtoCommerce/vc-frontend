<template>
  <VcTooltip :y-offset="4" :x-offset="0" placement="bottom-end" trigger="click">
    <template #trigger>
      <button type="button" class="rounded bg-[--color-additional-50] p-1.5 shadow-sm-x-y-button">
        <VcIcon class="block text-[--color-neutral-400]" name="cog" :size="16" />
      </button>
    </template>

    <template #content>
      <div class="flex select-none flex-row rounded bg-white shadow-sm-x-y-button">
        <slot />
      </div>
    </template>
  </VcTooltip>
</template>
