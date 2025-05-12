<template>
  <Transition name="subcategories--slide">
    <div v-if="item && item.children?.length" :data-target="item.route" class="subcategories">
      <ul class="subcategories__list">
        <VcMenuItem
          v-for="child in item.children"
          :key="child.id"
          class="subcategories__item"
          size="sm"
          :to="child.route"
          @click="$emit('close')"
        >
          {{ child.title }}
          <template v-if="child.children?.length" #append>
            <VcIcon class="subcategories__arrow" name="chevron-right" />
          </template>
        </VcMenuItem>
      </ul>
    </div>
  </Transition>

  <template v-for="_item in item.children" :key="_item.id">
    <Subcategories :item="_item" @close="$emit('close')" />
  </template>
</template>

<script setup lang="ts">
import type { ExtendedMenuLinkType } from "@/core/types";

interface IEmits {
  (e: "close"): void;
}

interface IProps {
  item: ExtendedMenuLinkType;
}

defineEmits<IEmits>();
defineProps<IProps>();
</script>

<style lang="scss">
.subcategories {
  @apply w-[21.5rem];

  &--slide {
    &-enter-active,
    &-leave-active {
      transition:
        width 0.3s ease,
        opacity 0.3s ease-in-out;

      & > * {
        width: calc(21.5rem - 2rem);
      }
    }

    &-enter-from,
    &-leave-to {
      width: 0;
      opacity: 0;
    }

    &-enter-to,
    &-leave-from {
      width: 21.5rem;
      opacity: 1;
    }
  }

  &__list {
    @apply flex-none w-[21.5rem];
  }

  &__arrow {
    @apply fill-secondary-400;
  }
}
</style>
