<template>
  <div class="flex items-center space-x-2 px-3 py-3 h-11 bg-red-100 rounded-sm">
    <i class="fa fa-times-circle text-red-500" aria-hidden="true"></i>
    <span><slot></slot></span>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped></style>
