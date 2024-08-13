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
        :name="$t('common.labels.toggle_vendor_select')"
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
          :target="target"
        >
          {{ name }}
        </VcProductTitle>

        <div
          v-if="withProperties || withPrice"
          :class="[
            'vc-line-item__properties',
            {
              'vc-line-item__properties--wide': !withPrice,
              'vc-line-item__properties--hide': !withProperties && withPrice,
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

          <VcProperty v-if="vendor" :label="$t('common.labels.vendor')" :disabled="disabled">
            {{ vendor.name }}
          </VcProperty>

          <VcProperty
            v-if="withPrice && !deleted"
            class="vc-line-item__property-price"
            :label="$t('common.labels.price_per_item')"
            :disabled="disabled"
          >
            <VcProductPrice :list-price="actualPrice || listPrice" :disabled="disabled" truncate />
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

        <div class="vc-line-item__mobile-row">
          <div class="vc-line-item__slot">
            <slot />
          </div>

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
          :aria-label="$t('common.buttons.remove_from_cart')"
          class="vc-line-item__remove-button"
          color="neutral"
          size="sm"
          variant="no-background"
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
import { computed, ref, watchEffect } from "vue";
import { useThemeContext } from "@/core/composables";
import type { Property, MoneyType, CommonVendor } from "@/core/api/graphql/types";
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
  vendor?: CommonVendor;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  properties: () => [],
});

const { themeContext } = useThemeContext();

const isSelected = ref<boolean>(true);

const target = computed(() => (themeContext.value?.settings?.show_details_in_separate_tab ? "_blank" : "_self"));

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

  --bg-color: var(--color-additional-50);

  @apply relative flex flex-col gap-2 p-3 rounded border shadow-md bg-[--bg-color];

  @container (width > theme("containers.2xl")) {
    @apply p-4 rounded-none border-0 shadow-none;
  }

  &--selected {
    $selected: &;
    --bg-color: var(--color-secondary-50);
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

  &:first-child {
    @container (width > theme("containers.2xl")) {
      @apply rounded-t-[inherit];
    }
  }

  &:last-child {
    @container (width > theme("containers.2xl")) {
      @apply rounded-b-[inherit];
    }
  }

  &__main {
    @apply flex items-start min-h-[1.25rem];

    @container (width > theme("containers.2xl")) {
      @apply items-center gap-3;
    }
  }

  &__checkbox {
    @apply flex-none absolute top-0.5 left-0.5 p-2 rounded bg-[--bg-color];

    @container (width > theme("containers.2xl")) {
      @apply static top-auto left-auto -m-2;
    }
  }

  &__img {
    @apply shrink-0 size-16 rounded border object-contain object-center;

    @container (width > theme("containers.2xl")) {
      @apply size-12;
    }

    @container (width > theme("containers.4xl")) {
      @apply size-16;
    }

    #{$disabled} &,
    #{$deleted} & {
      @apply opacity-50;
    }
  }

  &__content {
    @apply w-full;

    @container (width > theme("containers.2xl")) {
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

    @container (width > theme("containers.2xl")) {
      @apply grow min-h-0;
    }

    #{$removable} & {
      @apply pr-10 md:pr-0;
    }
  }

  &__properties {
    @apply flex-none mt-3;

    @container (width > theme("containers.2xl")) {
      @apply mt-0 w-40;
    }

    @container (width > theme("containers.4xl")) {
      @apply w-[11.875rem];
    }

    &--wide {
      @container (width > theme("containers.4xl")) {
        @apply w-[15.5rem];
      }
    }

    &--hide {
      @container (width > theme("containers.4xl")) {
        @apply hidden;
      }
    }
  }

  &__property-price {
    @container (width > theme("containers.4xl")) {
      @apply hidden;
    }

    * {
      @apply leading-[inherit] #{!important};
    }
  }

  &__price {
    --vc-product-price-font-size: theme(fontSize.sm);

    @container (width <= theme("containers.4xl")) {
      @apply hidden #{!important};
    }

    @container (width > theme("containers.4xl")) {
      @apply shrink-0 w-[8.25rem];
    }

    #{$deleted} & {
      @container (width > theme("containers.4xl")) {
        @apply invisible;
      }
    }
  }

  &__mobile-row {
    @apply contents;

    @container (width <= theme("containers.2xl")) {
      @apply flex items-center gap-3 mt-3;
    }
  }

  &__slot {
    @apply flex-none empty:hidden;

    &:has(.vc-quantity, * .vc-quantity) {
      @apply w-[6.5rem];
    }

    &:has(.vc-add-to-cart, * .vc-add-to-cart) {
      @apply w-full;

      @container (width > theme("containers.xs")) {
        @apply w-[13rem];
      }

      @container (width > theme("containers.2xl")) {
        @apply w-[15.7rem];
      }
    }

    #{$deleted} & {
      @container (width <= theme("containers.2xl")) {
        @apply hidden;
      }

      @container (width > theme("containers.2xl")) {
        @apply invisible;
      }
    }
  }

  &__total {
    --vc-product-price-font-size: theme(fontSize.sm);

    @apply w-full min-w-0;

    @container (width > theme("containers.2xl")) {
      --vc-product-price-font-size: theme(fontSize.sm);

      @apply shrink-0 w-[6.5rem];
    }

    @container (width > theme("containers.4xl")) {
      --vc-product-price-font-size: theme(fontSize.base);

      @apply w-[8.625rem];
    }
  }

  &__remove-button {
    @apply shrink-0;

    @container (width <= theme("containers.2xl")) {
      @apply top-0.5 right-0.5 absolute #{!important};
    }

    @container (width > theme("containers.2xl")) {
      @apply -my-2 -me-2;
    }
  }
}
</style>
