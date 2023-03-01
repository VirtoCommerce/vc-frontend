<template>
  <VcTooltip :y-offset="4" :x-offset="0" placement="bottom-end" trigger="click">
    <template #trigger>
      <button type="button" class="h-7 w-7 rounded bg-white text-gray-400 shadow-sm-x-y-button">
        <i class="fas fa-cog" />
      </button>
    </template>

    <template #content>
      <div class="flex select-none flex-row rounded bg-white shadow-sm-x-y-button">
        <slot />
      </div>
    </template>
  </VcTooltip>
</template>
