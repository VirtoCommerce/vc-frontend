<template>
  <div class="bg-gray-100 pt-7 pb-8 shadow-inner">
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <slot name="nav"></slot>
      <slot name="header"></slot>
      <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
        <div class="flex-grow w-full" :class="{ 'lg:w-3/4 xl:w-4/5': $slots.sidebar }">
          <slot></slot>
        </div>
        <aside
          v-if="$slots.sidebar"
          class="flex flex-col gap-y-6 px-5 mb-7 order-first md:px-0 lg:mb-6 lg:order-1 lg:w-1/4 lg:h-full lg:sticky lg:top-4"
        >
          <slot name="sidebar"></slot>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
