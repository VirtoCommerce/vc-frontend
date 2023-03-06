<template>
  <div
    :class="[
      'vc-line-item',
      {
        'vc-line-item--no-product': !extendedItem.extended.isProductExists,
      },
    ]"
  >
    <slot name="before" />

    <div class="vc-line-item__main">
      <!--  IMAGE -->
      <VcImage class="vc-line-item__img" :src="extendedItem.imageUrl" :alt="extendedItem.name" size-suffix="sm" lazy />

      <div class="vc-line-item__content">
        <div class="vc-line-item__name">
          <router-link
            v-if="extendedItem.extended.isProductExists && extendedItem.extended.route"
            :to="extendedItem.extended.route"
            :title="extendedItem.name"
            class="vc-line-item__name-link"
          >
            {{ extendedItem.name }}
          </router-link>

          <div v-else class="vc-line-item__name-text">
            {{ extendedItem.name }}
          </div>
        </div>

        <div class="vc-line-item__properties">
          <VcProperty
            v-for="property in extendedItem.extended.displayProperties"
            :key="property.id"
            :label="property.label"
            :value="property.value"
            :no-product="!extendedItem.extended.isProductExists"
          />

          <VcProperty
            class="2xl:hidden"
            :label="$t('common.labels.price_per_item')"
            :no-product="!extendedItem.extended.isProductExists"
          >
            <VcLineItemPrice :list-price="extendedItem.listPrice" :actual-price="extendedItem.salePrice" />
          </VcProperty>
        </div>

        <div class="vc-line-item__price">
          <VcLineItemPrice :list-price="extendedItem.listPrice" :actual-price="extendedItem.salePrice" />
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

    <slot name="after" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ExtendedLineItemType, extendLineItem } from "@/core";
import { LineItemType } from "@/xapi";

interface IProps {
  removable?: boolean;
  disabled?: boolean;
  item: LineItemType;
}

interface IEmits {
  (event: "remove"): void;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();
const extendedItem = computed<ExtendedLineItemType<LineItemType>>(() => extendLineItem<LineItemType>(props.item));
</script>

<style lang="scss">
.vc-line-item {
  $noProduct: "";
  $disabled: "";

  @apply p-3;

  &--no-product {
    $noProduct: &;
  }

  &--disabled {
    $disabled: &;
  }

  @media (min-width: theme("screens.md")) {
    @apply px-2;
  }

  @media (min-width: theme("screens.2xl")) {
    @apply p-4;
  }

  &__main {
    @apply flex items-start gap-3;

    @media (min-width: theme("screens.md")) {
      @apply items-center gap-2;
    }

    @media (min-width: theme("screens.2xl")) {
      @apply gap-3;
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
    @apply text-13 leading-4 font-bold line-clamp-4;

    @media (min-width: theme("screens.md")) {
      @apply shrink-0 w-[8.5rem];
    }

    @media (min-width: theme("screens.2xl")) {
      @apply w-44;
    }
  }

  &__name-link {
    @apply text-[color:var(--color-link)] [word-break:break-word] hover:text-[color:var(--color-link-hover)];

    #{$noProduct} & {
      @apply text-slate-400;
    }
  }

  &__name-text {
    @apply [word-break:break-word];

    #{$noProduct} & {
      @apply text-slate-400;
    }
  }

  &__properties {
    @apply mt-3;

    @media (min-width: theme("screens.md")) {
      @apply grow mt-0;
    }
  }

  &__price {
    @apply hidden;

    @media (min-width: theme("screens.2xl")) {
      @apply block shrink-0 w-[7.875rem] text-right;
    }
  }

  &__slot {
    @apply flex items-center gap-3 mt-4 empty:hidden;

    @media (min-width: theme("screens.md")) {
      @apply shrink-0 gap-2 mt-0 w-[15.625rem] empty:block;
    }

    @media (min-width: theme("screens.2xl")) {
      @apply gap-3;
    }
  }

  &__remove-button {
    @apply shrink-0 flex items-center justify-center h-7 w-7 rounded border-2 bg-white text-[color:var(--color-danger)];

    &:hover {
      @apply bg-gray-100;
    }

    &:disabled {
      @apply bg-gray-100 text-gray-400;
    }
  }
}
</style>
