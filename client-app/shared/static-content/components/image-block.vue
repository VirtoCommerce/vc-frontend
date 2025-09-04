<template>
  <div class="image-block pb-16 pt-6 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <img v-if="image" :src="image" :alt="alttext" />
    </div>
  </div>
</template>

<script setup lang="ts">

export interface IProps {
  image: string;
  alttext: string;
  background?: string;
}

defineProps<IProps>();

</script>
