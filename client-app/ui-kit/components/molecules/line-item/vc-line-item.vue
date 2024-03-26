<template>
  <div
    :class="[
      'vc-line-item',
      {
        'vc-line-item--removable': removable,
        'vc-line-item--disabled': disabled,
        'vc-line-item--selected': selected,
        'vc-line-item--deleted': deleted,
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
      <VcImage v-if="withImage" class="vc-line-item__img" :src="imageUrl" :alt="name" size-suffix="sm" lazy />

      <div
        :class="[
          'vc-line-item__content',
          {
            'vc-line-item__content--with-image': withImage,
            'vc-line-item__content--selectable': !withImage && selectable,
          },
        ]"
      >
        <VcProductTitle
          class="vc-line-item__name"
          :disabled="disabled || deleted"
          :to="route"
          :title="name"
          target="_blank"
        >
          {{ name }}
        </VcProductTitle>

        <div
          v-if="withProperties || withPrice"
          :class="[
            'vc-line-item__properties',
            {
              'vc-line-item__properties--wide': !withPrice,
              'vc-line-item__properties--hide-2xl': !withProperties && withPrice,
            },
          ]"
        >
          <template v-if="withProperties">
            <VcProperty
              v-for="property in properties"
              :key="property.name"
              :label="property.label!"
              :disabled="disabled || deleted"
            >
              {{ property.value }}
            </VcProperty>
          </template>

          <VcProperty
            v-if="withPrice && !deleted"
            class="2xl:hidden"
            :label="$t('common.labels.price_per_item')"
            :disabled="disabled"
          >
            <VcProductPrice
              class="vc-line-item__property-price"
              :list-price="actualPrice || listPrice"
              :disabled="disabled"
              truncate
            />
          </VcProperty>
        </div>

        <VcProductPrice
          v-if="withPrice"
          class="vc-line-item__price"
          :list-price="listPrice"
          :actual-price="actualPrice"
          :disabled="disabled"
          align="end"
        />

        <div class="vc-line-item__slot">
          <slot />

          <VcProductPrice
            v-if="withTotal"
            class="vc-line-item__total"
            :list-price="total"
            align="end"
            :disabled="disabled"
            truncate
          />
        </div>

        <VcButton
          v-if="removable"
          class="vc-line-item__remove-button"
          color="neutral"
          size="sm"
          variant="no-border"
          icon="x"
          :disabled="disabled"
          @click="$emit('remove')"
        />
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
  total?: MoneyType;
  selectable?: boolean;
  selected?: boolean;
  removable?: boolean;
  disabled?: boolean;
  deleted?: boolean;
  withImage?: boolean;
  withProperties?: boolean;
  withPrice?: boolean;
  withTotal?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  properties: () => [],
});

const isSelected = ref<boolean>(true);

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

  @apply relative flex flex-col gap-2 p-3 rounded border shadow-md;

  @media (min-width: theme("screens.md")) {
    @apply p-4 rounded-none border-0 shadow-none;
  }

  &--selected {
    $selected: &;

    @apply bg-secondary-50;
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
    @apply flex items-start min-h-[1.25rem];

    @media (min-width: theme("screens.md")) {
      @apply items-center gap-3;
    }
  }

  &__checkbox {
    @apply flex-none absolute top-0.5 left-0.5 p-2 rounded bg-additional-50;

    @media (min-width: theme("screens.md")) {
      @apply static top-auto left-auto -m-2;
    }

    #{$selected} & {
      @apply bg-secondary-50;
    }
  }

  &__img {
    @apply shrink-0 size-16 rounded border object-contain object-center;

    @media (min-width: theme("screens.lg")) {
      @apply size-12;
    }

    @media (min-width: theme("screens.xl")) {
      @apply size-16;
    }

    #{$disabled} &,
    #{$deleted} & {
      @apply opacity-50;
    }
  }

  &__content {
    @apply w-full;

    @media (min-width: theme("screens.md")) {
      @apply contents;
    }

    &--with-image {
      @apply w-[calc(100%-theme(width.16))] ps-3;
    }

    &--selectable {
      @apply ps-8;
    }
  }

  &__name {
    @apply text-sm;

    @media (min-width: theme("screens.md")) {
      @apply grow min-h-0;
    }

    #{$removable} & {
      @apply pr-10 md:pr-0;
    }
  }

  &__properties {
    @apply flex-none mt-3;

    @media (min-width: theme("screens.md")) {
      @apply mt-0 w-40;
    }

    @media (min-width: theme("screens.xl")) {
      @apply w-[11.875rem];
    }

    &--wide {
      @media (min-width: theme("screens.xl")) {
        @apply w-[15.5rem];
      }
    }

    &--hide-2xl {
      @apply 2xl:hidden;
    }
  }

  &__property-price {
    @apply leading-[inherit] #{!important};
  }

  &__price {
    --vc-product-price-font-size: theme(fontSize.sm);

    @apply max-2xl:hidden #{!important};

    @media (min-width: theme("screens.2xl")) {
      @apply shrink-0 w-[8.25rem];
    }

    #{$deleted} & {
      @media (min-width: theme("screens.2xl")) {
        @apply invisible;
      }
    }
  }

  &__slot {
    @apply flex items-center gap-3 empty:hidden max-md:mt-3;

    .vc-add-to-cart {
      @apply w-[11.75rem] xs:w-[13rem] 2xl:w-[15.7rem];
    }

    .vc-quantity {
      @apply w-[5rem] 2xl:w-[6.5rem];
    }

    #{$deleted} & {
      @apply max-md:hidden md:invisible;
    }
  }

  &__total {
    --vc-product-price-font-size: theme(fontSize.sm);

    @apply w-full min-w-0;

    @media (min-width: theme("screens.md")) {
      --vc-product-price-font-size: theme(fontSize.sm);

      @apply shrink-0 w-[6.5rem];
    }

    @media (min-width: theme("screens.xl")) {
      --vc-product-price-font-size: theme(fontSize.base);

      @apply w-[8.625rem];
    }
  }

  &__remove-button {
    @apply shrink-0 max-md:top-0.5 max-md:right-0.5 max-md:absolute md:-my-2 md:-me-2 #{!important};
  }
}
</style>
