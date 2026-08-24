<template>
  <div class="identity-providers-panel">
    <div class="identity-providers-panel__divider">
      {{ dividerText }}
    </div>

    <IdentityProviders :providers="providers" :return-url="returnUrl" class="identity-providers-panel__providers" />
  </div>
</template>

<script setup lang="ts">
import IdentityProviders from "./identity-providers.vue";

interface IProps {
  providers: string[];
  returnUrl: string;
  dividerText: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.identity-providers-panel {
  @apply mt-8 flex w-full flex-col gap-8;

  @media (width > theme("screens.sm")) {
    @apply w-72 flex-row gap-6;
  }

  @media (width > theme("screens.lg")) {
    @apply w-[30rem] gap-16;
  }

  &__divider {
    @apply relative flex flex-col items-center uppercase;

    @media (width > theme("screens.sm")) {
      @apply flex-row;
    }

    &::before,
    &::after {
      @apply content-[''] absolute h-px w-[calc(50%-2rem)] top-1/2 bg-neutral-300;

      @media (width > theme("screens.sm")) {
        @apply h-[calc(50%-2rem)] w-px;
      }
    }

    &::before {
      @apply left-0;

      @media (width > theme("screens.sm")) {
        @apply top-2 left-1/2;
      }
    }

    &::after {
      @apply right-0;

      @media (width > theme("screens.sm")) {
        @apply top-auto bottom-2 left-1/2;
      }
    }
  }

  &__providers {
    @apply max-sm:mx-auto;

    @media (width > theme("screens.lg")) {
      @apply w-60;
    }
  }
}
</style>
