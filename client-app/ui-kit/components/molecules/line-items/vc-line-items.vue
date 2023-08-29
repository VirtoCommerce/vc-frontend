<template>
  <div class="vc-line-items">
    <!-- table header -->
    <div class="vc-line-items__head">
      <VcCheckbox v-if="selectable" v-model="selectAll" @change="$emit('select:allItems', selectAll)" />

      <div class="vc-line-items__product">
        {{ $t("common.labels.product") }}
      </div>

      <div class="vc-line-items__properties">{{ $t("common.labels.properties") }}</div>

      <div class="vc-line-items__price">
        {{ $t("common.labels.price_per_item") }}
      </div>

      <div class="vc-line-items__slot">
        <slot name="titles" />
      </div>

      <div v-if="removable" class="vc-line-items__removable"></div>
    </div>

    <!-- table body -->
    <div v-if="items.length" class="vc-line-items__body">
      <VcLineItem
        v-for="item in items"
        :key="item.id"
        :image-url="item.imageUrl"
        :name="item.name"
        :route="item.route"
        :deleted="item.deleted"
        :properties="item.properties"
        :disabled="disabled"
        :list-price="item.listPrice"
        :actual-price="item.actualPrice"
        :removable="removable"
        :selectable="selectable"
        :selected="selectedItems?.includes(item.id)"
        @select="$emit('select:item', { id: item.id, selected: $event })"
        @remove="$emit('remove:item', item)"
      >
        <template #before>
          <slot name="before-content" v-bind="{ item }" />
        </template>

        <template #default>
          <slot v-bind="{ item }" />
        </template>

        <template #after>
          <slot name="after-content" v-bind="{ item }" />
        </template>
      </VcLineItem>
    </div>

    <!-- table footer -->
    <div class="vc-line-items__foot">
      <template v-if="selectable">
        <VcButton
          class="vc-line-items__button vc-line-items__button--desktop"
          size="xs"
          :disabled="!filteredSelectedItems.length"
          @click="removeSelectedItems"
        >
          {{ $t("common.buttons.remove_selected") }}
        </VcButton>

        <VcButton
          class="vc-line-items__button vc-line-items__button--mobile"
          size="xs"
          variant="outline"
          @click="removeAllItems"
        >
          {{ $t("common.buttons.remove_all") }}
        </VcButton>
      </template>

      <div v-if="!disableSubtotal" class="vc-line-items__subtotal">
        <span class="vc-line-items__subtotal-label">{{ $t("common.labels.subtotal") }}:</span>
        <span class="vc-line-items__subtotal-sum">{{ $n(subtotal, "currency") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _, { sumBy } from "lodash";
import { computed, ref, watchEffect } from "vue";
import type { PreparedLineItemType } from "@/core/types";

interface IEmits {
  (event: "remove:item", value: PreparedLineItemType): void;
  (event: "remove:selectedItems", value: string[]): void;
  (event: "select:item", value: { id: string; selected: boolean }): void;
  (event: "select:allItems", value: boolean): void;
}

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  removable?: boolean;
  items?: PreparedLineItemType[];
  selectedItems?: string[];
  disableSubtotal?: boolean;
  selectable?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
});

const selectAll = ref<boolean>(false);

const subtotal = computed<number>(() => sumBy(props.items, (item: PreparedLineItemType) => item.extendedPrice?.amount));

const filteredSelectedItems = computed(() => _.intersection(props.selectedItems, _.map(props.items, "id")));

const allItemsSelected = computed<boolean>(() => filteredSelectedItems.value.length === props.items.length);

watchEffect(() => {
  selectAll.value = allItemsSelected.value;
});

function removeSelectedItems() {
  emit("remove:selectedItems", filteredSelectedItems.value);
}

function removeAllItems() {
  emit("remove:selectedItems", _.map(props.items, "id"));
}
</script>

<style lang="scss">
.vc-line-items {
  @screen md {
    @apply border rounded divide-y;
  }

  &__head {
    @apply hidden;

    @screen md {
      @apply flex items-center gap-3 py-0.5 px-3 min-h-[2.75rem] text-sm font-bold;
    }

    @screen 2xl {
      @apply px-3;
    }
  }

  &__product {
    @apply flex-none w-[12.75rem];

    @screen lg {
      @apply w-[11.75rem];
    }

    @screen xl {
      @apply w-[16.75rem];
    }
  }

  &__properties {
    @apply flex-grow;
  }

  &__price {
    @apply hidden;

    @screen 2xl {
      @apply flex-none block w-[8.75rem] text-right;
    }
  }

  &__slot {
    @apply shrink-0 flex items-center justify-between w-[15.75rem];

    @screen md {
      @apply gap-4;
    }

    @screen lg {
      @apply w-1/3;
    }

    @screen xl {
      @apply w-[15.85rem];
    }
  }

  &__removable {
    @apply w-7;
  }

  &__body {
    @apply flex flex-col gap-4 md:gap-0 md:divide-y;

    @screen md {
      @apply space-y-0 divide-y;
    }
  }

  &__foot {
    @apply flex justify-end py-2.5;

    @screen md {
      @apply px-3;
    }

    &:empty {
      @apply hidden;
    }
  }

  &__button {
    @apply me-auto;

    &--mobile.vc-button {
      @screen md {
        @apply hidden;
      }
    }

    &--desktop.vc-button {
      @apply hidden;

      @screen md {
        @apply inline-block;
      }
    }
  }

  &__subtotal {
    @apply ms-1 justify-self-end flex items-center gap-2 text-[--color-success-600];
  }

  &__subtotal-label {
    @apply text-xs font-bold;
  }

  &__subtotal-sum {
    @apply text-base font-black;
  }
}
</style>
