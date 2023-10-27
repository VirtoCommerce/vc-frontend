<template>
  <div class="vc-line-items">
    <!-- table header -->
    <div class="vc-line-items__head">
      <VcCheckbox
        v-if="selectable"
        :model-value="isAllItemsSelected"
        class="vc-line-items__checkbox"
        @change="($event) => selectAllItems($event as boolean)"
      />

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
        :selected="selectedItemIds?.includes(item.id)"
        @select="($event) => selectSingleItem(item.id, $event)"
        @remove="() => removeSingleItem(item.id)"
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
          :disabled="!selectedItemIds.length"
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
import { intersection, map, sumBy } from "lodash";
import { computed } from "vue";
import type { PreparedLineItemType } from "@/core/types";

interface IEmits {
  (event: "remove:items", value: string[]): void;
  (event: "select:items", value: { itemIds: string[]; selected: boolean }): void;
}

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  removable?: boolean;
  items?: PreparedLineItemType[];
  sharedSelectedItemIds?: string[];
  disableSubtotal?: boolean;
  selectable?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
});

const subtotal = computed<number>(() =>
  sumBy(
    props.items.filter((item) => selectedItemIds.value.includes(item.id)),
    (item) => item.extendedPrice?.amount,
  ),
);

const itemIds = computed(() => map(props.items, "id"));
const selectedItemIds = computed(() => intersection(props.sharedSelectedItemIds, itemIds.value));
const isAllItemsSelected = computed(() => selectedItemIds.value.length === props.items.length);

function selectSingleItem(itemId: string, value: boolean) {
  emit("select:items", { itemIds: [itemId], selected: value });
}

function selectAllItems(value: boolean) {
  emit("select:items", { itemIds: itemIds.value, selected: value });
}

function removeSingleItem(itemId: string) {
  emit("remove:items", [itemId]);
}

function removeSelectedItems() {
  emit("remove:items", selectedItemIds.value);
}

function removeAllItems() {
  emit("remove:items", itemIds.value);
}
</script>

<style lang="scss">
.vc-line-items {
  @media (min-width: theme("screens.md")) {
    @apply border rounded divide-y;
  }

  &__head {
    @apply hidden;

    @media (min-width: theme("screens.md")) {
      @apply flex items-center gap-3 py-0.5 px-3 min-h-[2.75rem] text-sm font-bold;
    }

    @media (min-width: theme("screens.2xl")) {
      @apply px-3;
    }
  }

  &__product {
    @apply flex-none w-[12.75rem];

    @media (min-width: theme("screens.lg")) {
      @apply w-[11.75rem];
    }

    @media (min-width: theme("screens.xl")) {
      @apply w-[16.75rem];
    }
  }

  &__properties {
    @apply flex-grow;
  }

  &__price {
    @apply hidden;

    @media (min-width: theme("screens.2xl")) {
      @apply flex-none block w-[8.75rem] text-right;
    }
  }

  &__slot {
    @apply shrink-0 flex items-center justify-between w-[15.75rem];

    @media (min-width: theme("screens.md")) {
      @apply gap-4;
    }

    @media (min-width: theme("screens.lg")) {
      @apply w-1/3;
    }

    @media (min-width: theme("screens.xl")) {
      @apply w-[15.85rem];
    }
  }

  &__removable {
    @apply w-7;
  }

  &__body {
    @apply flex flex-col gap-4;

    @media (min-width: theme("screens.md")) {
      @apply gap-0 space-y-0 divide-y;
    }
  }

  &__foot {
    @apply flex justify-end py-2.5;

    @media (min-width: theme("screens.md")) {
      @apply px-3;
    }

    &:empty {
      @apply hidden;
    }
  }

  &__button {
    @apply me-1;

    &--mobile.vc-button {
      @media (min-width: theme("screens.md")) {
        @apply hidden;
      }
    }

    &--desktop.vc-button {
      @apply hidden;

      @media (min-width: theme("screens.md")) {
        @apply inline-block;
      }
    }
  }

  &__subtotal {
    @apply ms-auto justify-self-end flex items-center gap-2 text-[--color-success-600];
  }

  &__subtotal-label {
    @apply text-xs font-bold;
  }

  &__subtotal-sum {
    @apply text-base font-black;
  }
}
</style>
