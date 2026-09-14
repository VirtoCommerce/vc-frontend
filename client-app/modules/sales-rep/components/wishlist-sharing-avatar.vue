<template>
  <span class="wishlist-sharing-avatar" aria-hidden="true">
    <VcImage v-if="imageUrl" :src="imageUrl" alt="" class="wishlist-sharing-avatar__image" />

    <template v-else>{{ initials }}</template>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  organizationName: string;
  /** The organization's own logo; initials stand in when it has none. */
  imageUrl?: string;
}

const props = defineProps<IProps>();

const initials = computed(() =>
  props.organizationName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join(""),
);
</script>

<style lang="scss">
.wishlist-sharing-avatar {
  @apply flex shrink-0 items-center justify-center size-8 rounded-full bg-secondary-500 text-xs font-black text-additional-50 overflow-clip;

  &__image {
    @apply size-full object-cover;
  }
}
</style>
