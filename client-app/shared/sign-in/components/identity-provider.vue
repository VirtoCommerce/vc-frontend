<template>
  <VcButton class="identity-provider" variant="outline" color="secondary" @click="$emit('signIn')">
    <template #prepend>
      <VcImage class="identity-provider__icon" :alt="text" :src="icon" />
    </template>
    {{ text }}
  </VcButton>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "signIn"): void;
}

interface IProps {
  text: string;
  icon: string;
}

defineEmits<IEmits>();
defineProps<IProps>();
</script>

<style lang="scss">
.identity-provider {
  @apply w-full;

  &__icon {
    @apply mr-2 size-5;
  }
}
</style>
