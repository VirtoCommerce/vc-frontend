<template>
  <div
    :class="[
      'vc-line-item',
      {
        'vc-line-item--removable': removable,
        'vc-line-item--disabled': disabled,
        'vc-line-item--selected': selected,
        'vc-line-item--deleted': deleted,
        'vc-line-item--removed': removed,
      },
    ]"
  >
    <div v-if="$slots.before" class="vc-line-item__before">
      <slot name="before" />
    </div>

    <div class="vc-line-item__main">
      <VcCheckbox
        v-if="selectable"
        v-model="isSelected"
        class="vc-line-item__checkbox"
        :disabled="disabled"
        @change="$emit('select', isSelected)"
      />

      <!--  IMAGE -->
      <VcImage class="vc-line-item__img" :src="imageUrl" :alt="name" size-suffix="sm" lazy />

      <div class="vc-line-item__content">
        <div class="vc-line-item__name">
          <router-link v-if="!deleted && route" :to="route" :title="name" class="vc-line-item__name-link">
            {{ name }}
          </router-link>

          <div v-else class="vc-line-item__name-text">
            {{ name }}
          </div>
        </div>

        <div class="vc-line-item__properties">
          <VcProperty v-for="property in properties" :key="property.name" :label="property.label!">
            {{ property.value }}
          </VcProperty>

          <VcProperty :label="$t('common.labels.price_per_item')">
            <VcLineItemPrice :list-price="listPrice" :actual-price="actualPrice" />
          </VcProperty>
        </div>

        <div class="vc-line-item__price">
          <VcLineItemPrice :list-price="listPrice" :actual-price="actualPrice" />
        </div>

        <div class="vc-line-item__slot">
          <slot />
        </div>

        <VcButton
          v-if="removable"
          class="vc-line-item__remove-button"
          color="secondary"
          size="xs"
          variant="outline"
          icon
          :disabled="disabled"
          @click="$emit('remove')"
        >
          <VcIcon v-if="removed" class="text-[--color-success-500]" name="reset" />
          <VcIcon v-else class="text-[--color-danger-500]" name="delete-2" />
        </VcButton>
      </div>
    </div>

    <div v-if="$slots.after" class="vc-line-item__after">
      <slot name="after" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { Property, MoneyType } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "remove"): void;
  (event: "select", value: boolean): void;
}

interface IProps {
  imageUrl?: string;
  name: string;
  route?: RouteLocationRaw;
  properties?: Property[];
  listPrice?: MoneyType;
  actualPrice?: MoneyType;
  selectable?: boolean;
  selected?: boolean;
  removable?: boolean;
  disabled?: boolean;
  deleted?: boolean;
  removed?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  properties: () => [],
});

const isSelected = ref<boolean>(false);

watchEffect(() => {
  isSelected.value = props.selected;
});
</script>

<style lang="scss">
.vc-line-item {
  $selected: "";
  $removable: "";
  $removed: "";
  $deleted: "";
  $disabled: "";

  @apply flex flex-col gap-2 p-3 rounded border shadow-t-3sm;

  @media (min-width: theme("screens.md")) {
    @apply px-3 rounded-none border-0 shadow-none;
  }

  &--selected {
    $selected: &;

    @apply bg-[--color-secondary-50];
  }

  &--removable {
    $removable: &;
  }

  &--deleted {
    $deleted: &;
  }

  &--removed {
    $removed: &;
  }

  &--disabled {
    $disabled: &;
  }

  &__before,
  &__after {
    &:empty {
      @apply hidden;
    }
  }

  &__main {
    @apply relative flex items-start gap-3;

    @media (min-width: theme("screens.md")) {
      @apply items-center;
    }
  }

  &__checkbox {
    @apply flex-none absolute -top-2 -left-2 p-2 rounded bg-[--color-additional-50];

    @media (min-width: theme("screens.md")) {
      @apply static top-auto left-auto -mx-2;
    }

    #{$selected} & {
      @apply bg-[--color-secondary-50];
    }
  }

  &__img {
    @apply shrink-0 w-16 h-16 rounded border;

    @media (min-width: theme("screens.lg")) {
      @apply w-12 h-12;
    }

    @media (min-width: theme("screens.xl")) {
      @apply w-16 h-16;
    }
  }

  &__content {
    @apply grow;

    @media (min-width: theme("screens.md")) {
      @apply contents;
    }
  }

  &__name {
    @apply min-h-[2rem] text-sm/[1rem] font-bold line-clamp-4;

    @media (min-width: theme("screens.md")) {
      @apply shrink-0 min-h-0 w-[8rem];
    }

    @media (min-width: theme("screens.xl")) {
      @apply w-48;
    }

    #{$removable} & {
      @apply pr-10 md:pr-0;
    }
  }

  &__name-link {
    @apply text-[--color-accent-600];

    word-break: break-word;

    &:hover {
      @apply text-[--color-accent-700];
    }

    #{$deleted} &,
    #{$removed} & {
      @apply text-[--color-neutral-500] cursor-not-allowed;
    }
  }

  &__name-text {
    word-break: break-word;

    #{$deleted} &,
    #{$removed} & {
      @apply text-[--color-neutral-500];
    }
  }

  &__properties {
    @apply space-y-px mt-3;

    @media (min-width: theme("screens.md")) {
      @apply grow mt-0;
    }

    #{$removed} &,
    #{$deleted} & {
      --vc-property-label-color: var(--color-neutral-500);
      --vc-property-value-color: var(--color-neutral-500);
    }
  }

  &__price {
    @apply hidden;

    @media (min-width: theme("screens.2xl")) {
      @apply w-[8.5rem];
    }

    @media (min-width: theme("screens.2xl")) {
      @apply block shrink-0 text-right;
    }

    #{$removed} & {
      --vc-line-item-price-actual-color: var(--color-neutral-500);
    }

    #{$deleted} & {
      @apply hidden;

      @media (min-width: theme("screens.2xl")) {
        @apply block invisible;
      }
    }
  }

  &__slot {
    @apply flex items-start gap-1 mt-4 empty:hidden;

    @media (min-width: theme("screens.md")) {
      @apply flex-shrink-0 items-center gap-2 mt-0 w-64 empty:block;
    }

    @media (min-width: theme("screens.lg")) {
      @apply w-1/3;
    }

    @media (min-width: theme("screens.xl")) {
      @apply w-64;
    }

    #{$removed} & {
      --vc-line-item-total-actual-color: var(--color-neutral-500);
    }

    #{$deleted} & {
      @apply hidden md:block md:invisible;
    }
  }

  &__remove-button {
    @apply shrink-0 absolute top-0 right-0;

    @media (min-width: theme("screens.md")) {
      @apply relative;
    }
  }
}
</style>
