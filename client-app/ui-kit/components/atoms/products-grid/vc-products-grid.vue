<template>
  <div
    :class="[
      'vc-products-grid',
      {
        'vc-products-grid--short': short,
      },
    ]"
  >
    <div class="vc-products-grid__wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  short?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-products-grid {
  $short: "";

  @apply @container;

  &--short {
    $short: &;
  }

  &__wrapper {
    @apply flex flex-wrap items-stretch gap-6;

    @container (width > theme(containers.3xl)) {
      @apply gap-7;
    }

    & > * {
      width: calc((100% - theme("space.6")) / 2);

      @container (width > theme(containers.md)) {
        width: calc((100% - 2 * theme("space.6")) / 3);
      }

      @container (width > theme(containers.xl)) {
        width: calc((100% - 3 * theme("space.6")) / 4);
      }

      @container (width > theme(containers.3xl)) {
        width: calc((100% - 4 * theme("space.7")) / 5);
      }

      @container (width > theme(containers.4xl)) {
        width: calc((100% - 5 * theme("space.7")) / 6);
      }

      #{$short} & {
        @apply hidden;

        &:nth-child(1),
        &:nth-child(2),
        &:nth-child(3),
        &:nth-child(4) {
          @apply block;
        }

        @container (width > theme(containers.md)) {
          &:nth-child(4) {
            @apply hidden;
          }
        }

        @container (width > theme(containers.xl)) {
          &:nth-child(4) {
            @apply block;
          }
        }

        @container (width > theme(containers.3xl)) {
          &:nth-child(5) {
            @apply block;
          }
        }

        @container (width > theme(containers.4xl)) {
          &:nth-child(6) {
            @apply block;
          }
        }
      }
    }
  }
}
</style>
