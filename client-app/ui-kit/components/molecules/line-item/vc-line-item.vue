<template>
  <div
    :class="[
      'vc-line-item',
      {
        'vc-line-item--removable': removable,
        'vc-line-item--disabled': disabled,
        'vc-line-item--deleted': deleted,
      },
    ]"
  >
    <div v-if="$slots.before" class="vc-line-item__before">
      <slot name="before" />
    </div>

    <div class="vc-line-item__main">
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
          <VcProperty v-for="property in properties" :key="property.name" :label="property.label">
            {{ property.value }}
          </VcProperty>

          <VcProperty class="2xl:hidden" :label="$t('common.labels.price_per_item')">
            <VcLineItemPrice :list-price="listPrice" :actual-price="actualPrice" />
          </VcProperty>
        </div>

        <div class="vc-line-item__price">
          <VcLineItemPrice :list-price="listPrice" :actual-price="actualPrice" />
        </div>

        <div class="vc-line-item__slot">
          <slot />
        </div>

        <button
          v-if="removable"
          class="vc-line-item__remove-button"
          type="button"
          :disabled="disabled"
          @click="$emit('remove')"
        >
          <VcIcon name="delete-2" size="xs" />
        </button>
      </div>
    </div>

    <div v-if="$slots.after" class="vc-line-item__after">
      <slot name="after" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Property, MoneyType } from "@/xapi/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "remove"): void;
}

interface IProps {
  imageUrl?: string;
  name: string;
  route?: RouteLocationRaw;
  properties?: Property[];
  listPrice?: MoneyType;
  actualPrice?: MoneyType;
  removable?: boolean;
  disabled?: boolean;
  deleted?: boolean;
}

defineEmits<IEmits>();
withDefaults(defineProps<IProps>(), {
  properties: () => [],
});
</script>

<style lang="scss">
.vc-line-item {
  $removable: "";
  $deleted: "";
  $disabled: "";

  @apply flex flex-col gap-2 p-3 rounded border shadow-t-3sm;

  &--removable {
    $removable: &;
  }

  &--deleted {
    $deleted: &;
  }

  &--disabled {
    $disabled: &;
  }

  @media (min-width: theme("screens.md")) {
    @apply px-3 rounded-none border-0 shadow-none;
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
      @apply items-center gap-4;
    }
  }

  &__img {
    @apply shrink-0 w-16 h-16 rounded border;
  }

  &__content {
    @apply grow;

    @media (min-width: theme("screens.md")) {
      @apply contents;
    }
  }

  &__name {
    @apply min-h-[2rem] text-13 leading-4 font-bold line-clamp-4;

    @media (min-width: theme("screens.md")) {
      @apply shrink-0 min-h-0 w-[8.5rem];
    }

    @media (min-width: theme("screens.2xl")) {
      @apply w-44;
    }

    #{$removable} & {
      @apply pr-10 md:pr-0;
    }
  }

  &__name-link {
    @apply text-[color:var(--color-link)];

    word-break: break-word;

    &:hover {
      @apply text-[color:var(--color-link-hover)];
    }

    #{$deleted} & {
      @apply text-slate-400;
    }
  }

  &__name-text {
    word-break: break-word;

    #{$deleted} & {
      @apply text-slate-400;
    }
  }

  &__properties {
    @apply mt-3;

    @media (min-width: theme("screens.md")) {
      @apply grow mt-0;
    }

    #{$deleted} & {
      @apply hidden md:block md:invisible;
    }
  }

  &__price {
    @apply hidden;

    @media (min-width: theme("screens.2xl")) {
      @apply block shrink-0 w-[8.75rem] text-right;
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
      @apply flex-shrink-0 items-center gap-4 mt-0 w-[15.75rem] empty:block;
    }

    @media (min-width: theme("screens.lg")) {
      @apply w-1/3;
    }

    @media (min-width: theme("screens.xl")) {
      @apply w-[15.75rem];
    }

    #{$deleted} & {
      @apply hidden md:block md:invisible;
    }
  }

  &__remove-button {
    @apply shrink-0 absolute top-0 right-0 flex items-center justify-center h-7 w-7 rounded border-2 bg-white text-[color:var(--color-danger)];

    &:hover {
      @apply bg-gray-100;
    }

    #{$disabled} &,
    &:disabled {
      @apply bg-gray-100 text-gray-400;
    }

    @media (min-width: theme("screens.md")) {
      @apply relative;
    }
  }
}
</style>
