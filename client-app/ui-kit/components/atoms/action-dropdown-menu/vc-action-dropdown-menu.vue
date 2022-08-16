<template>
  <VcTooltip :y-offset="4" :x-offset="0" placement="bottom-end" trigger="click">
    <template #trigger>
      <button class="w-7 h-7 rounded shadow-sm-x-y-button bg-white text-gray-400">
        <i class="fas fa-cog" />
      </button>
    </template>

    <template #content>
      <div class="flex flex-row bg-white select-none rounded shadow-sm-x-y-button">
        <slot />
      </div>
    </template>
  </VcTooltip>
</template>
