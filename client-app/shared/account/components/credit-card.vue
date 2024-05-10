<template>
  <div
    class="relative rounded bg-[--color-additional-50] p-4 text-sm shadow-md md:flex md:items-center md:gap-6 md:px-5"
  >
    <div class="flex grow items-center gap-2 pe-10">
      <VcIcon class="text-warning" name="credit-card" size="lg" />
      {{ cardNumber }}
    </div>

    <div v-if="cardExpiration" class="flex items-center max-md:pt-4">
      {{ $t("common.prefixes.expires") }} {{ cardExpiration }}
    </div>

    <div class="absolute right-4 top-4 md:relative md:right-auto md:top-auto">
      <VcButton color="neutral" size="sm" variant="no-background" icon="delete-2" @click="$emit('remove')" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "remove"): void;
}

interface IProps {
  cardNumber: string;
  cardExpiration?: string;
}

defineEmits<IEmits>();

defineProps<IProps>();
</script>
