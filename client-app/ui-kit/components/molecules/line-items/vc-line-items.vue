<template>
  <div class="vc-line-items">
    <div class="vc-line-items__container">
      <!-- table header -->
      <div v-if="withHeader" class="vc-line-items__head">
        <VcCheckbox
          v-if="selectable"
          :name="$t('ui_kit.labels.toggle_vendor_select')"
          :model-value="isAllItemsSelected"
          :indeterminate="isSomeItemsSelected"
          class="vc-line-items__checkbox"
          test-id="vc-line-items-head-checkbox"
          @change="($event) => selectAllItems($event as boolean)"
        />

        <div class="vc-line-items__product">
          {{ $t("ui_kit.labels.product") }}
        </div>

        <div
          v-if="showProperties"
          :class="[
            'vc-line-items__properties',
            {
              'vc-line-items__properties--wide': !showPrice,
            },
          ]"
        >
          {{ $t("ui_kit.labels.properties") }}
        </div>

        <div v-if="showPrice" class="vc-line-items__price">
          {{ $t("ui_kit.labels.price_per_item") }}
        </div>

        <div v-if="$slots.default" class="vc-line-items__slot" :style="{ width: slotWidth }">
          <slot name="titles" />
        </div>

        <div v-if="showTotal" class="vc-line-items__total">
          {{ $t("ui_kit.labels.total") }}
        </div>

        <div v-if="removable" class="vc-line-items__removable"></div>
      </div>

      <!-- table body -->
      <div v-if="items.length || $slots['line-items']" class="vc-line-items__body">
        <slot name="line-items">
          <VcLineItem
            v-for="item in items"
            :key="item.id"
            :image-url="item.imageUrl"
            :name="item.name"
            :route="item.route"
            :properties="item.properties"
            :list-price="item.listPrice"
            :actual-price="item.actualPrice"
            :total="item.extendedPrice"
            :list-total="item.listTotal"
            :with-image="showImage"
            :with-properties="showProperties"
            :with-price="showPrice"
            :with-total="showTotal"
            :disabled="disabled"
            :deleted="item.deleted"
            :removable="removable"
            :selectable="selectable"
            :selected="selectable && selectedItemIds?.includes(item.id)"
            :browser-target="browserTarget"
            :show-placed-price="item.showPlacedPrice"
            :data-product-sku="item.sku"
            @select="($event) => selectSingleItem(item.id, $event)"
            @remove="() => removeSingleItem(item.id)"
            @link-click="$emit('linkClick', item)"
          >
            <template #before>
              <slot name="before-content" v-bind="{ item }" />
            </template>

            <template v-if="$slots.default" #default>
              <div ref="slotElements">
                <slot v-bind="{ item }" />
              </div>
            </template>

            <template #after>
              <slot name="after-content" v-bind="{ item }" />
            </template>
          </VcLineItem>
        </slot>
      </div>
      <slot name="after-items" />

      <!-- table footer -->
      <div v-if="selectable || withSubtotal" class="vc-line-items__foot">
        <template v-if="selectable">
          <VcButton
            class="vc-line-items__button vc-line-items__button--desktop"
            color="secondary"
            variant="outline"
            size="xs"
            :disabled="!selectedItemIds.length"
            @click="removeSelectedItems"
          >
            {{ $t("ui_kit.buttons.remove_selected") }}
          </VcButton>

          <VcButton
            class="vc-line-items__button vc-line-items__button--mobile"
            color="secondary"
            size="xs"
            variant="outline"
            @click="removeAllItems"
          >
            {{ $t("ui_kit.buttons.remove_all") }}
          </VcButton>
        </template>

        <div v-if="withSubtotal" class="vc-line-items__subtotal">
          <span class="vc-line-items__subtotal-label">{{ $t("ui_kit.labels.subtotal") }}:</span>
          <span class="vc-line-items__subtotal-sum">{{ $n(subtotal, "currency") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { intersection, map, sumBy } from "lodash";
import { computed, ref, watchEffect } from "vue";
import type { PreparedLineItemType } from "@/core/types";

interface IEmits {
  (event: "remove:items", value: string[]): void;
  (event: "select:items", value: { itemIds: string[]; selected: boolean }): void;
  (event: "linkClick", value: PreparedLineItemType): void;
}

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  removable?: boolean;
  items?: PreparedLineItemType[];
  sharedSelectedItemIds?: string[];
  selectable?: boolean;
  withImage?: boolean;
  withProperties?: boolean;
  withPrice?: boolean;
  withTotal?: boolean;
  withSubtotal?: boolean;
  withHeader?: boolean;
  browserTarget?: BrowserTargetType;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
  withHeader: true,
  browserTarget: "_blank",
});

const slotElements = ref<HTMLElement[]>([]);
const slotWidth = ref<string>("");

const showImage = computed(() => props.withImage && props.items.some((item) => item.imageUrl));
const showProperties = computed(() => props.withProperties && props.items.some((item) => item.properties?.length));
const showPrice = computed(() => props.withPrice && props.items.some((item) => item.listPrice || item.actualPrice));
const showTotal = computed(() => props.withTotal && hasTotal.value);

const hasTotal = computed(() => props.items.some((item) => item.extendedPrice));

const subtotal = computed<number>(() =>
  hasTotal.value
    ? sumBy(
        props.items.filter((item) => selectedItemIds.value.includes(item.id) && item.extendedPrice),
        (item) => item.extendedPrice!.amount,
      )
    : 0,
);

const itemIds = computed(() => map(props.items, "id"));
const selectedItemIds = computed(() =>
  props.sharedSelectedItemIds ? intersection(props.sharedSelectedItemIds, itemIds.value) : itemIds.value,
);
const isAllItemsSelected = computed(() => selectedItemIds.value.length === props.items.length);
const isSomeItemsSelected = computed(
  () => selectedItemIds.value.length > 0 && selectedItemIds.value.length < props.items.length,
);

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

watchEffect(() => {
  slotWidth.value = slotElements.value[0] ? `${slotElements.value[0].clientWidth}px` : "";
});
</script>

<style lang="scss">
.vc-line-items {
  @apply @container;

  &__container {
    @container (width > theme("containers.2xl")) {
      @apply border rounded divide-y;
    }
  }

  &__head {
    @apply hidden;

    @container (width > theme("containers.2xl")) {
      @apply flex items-center gap-3 py-0.5 px-4 min-h-[2.75rem] text-sm font-bold;
    }
  }

  &__product {
    @apply flex-grow;
  }

  &__properties {
    @apply flex-none;

    @container (width > theme("containers.2xl")) {
      @apply w-40;
    }

    @container (width > theme("containers.4xl")) {
      @apply w-[11.875rem];
    }

    &--wide {
      @container (width > theme("containers.4xl")) {
        @apply w-[15.5rem];
      }
    }
  }

  &__price {
    @apply hidden;

    @container (width > theme("containers.4xl")) {
      @apply flex-none block w-[8.25rem] text-end;
    }
  }

  &__total {
    @apply text-end;

    @container (width > theme("containers.2xl")) {
      @apply shrink-0 w-[6.5rem];
    }

    @container (width > theme("containers.4xl")) {
      @apply w-[8.625rem];
    }
  }

  &__removable {
    @apply w-7;
  }

  &__body {
    @apply flex flex-col gap-4;

    @container (width > theme("containers.2xl")) {
      @apply gap-0 space-y-0 divide-y;

      &:first-child {
        @apply rounded-t;
      }

      &:last-child {
        @apply rounded-b;
      }
    }
  }

  &__foot {
    @apply flex justify-end py-2.5;

    @container (width > theme("containers.2xl")) {
      @apply px-3;
    }

    &:empty {
      @apply hidden;
    }
  }

  &__button {
    @apply me-1;

    &--mobile.vc-button {
      @container (width > theme("containers.2xl")) {
        @apply hidden;
      }
    }

    &--desktop.vc-button {
      @apply hidden;

      @container (width > theme("containers.2xl")) {
        @apply inline-block;
      }
    }
  }

  &__subtotal {
    @apply ms-auto justify-self-end flex items-center gap-2 text-[--price-color];
  }

  &__subtotal-label {
    @apply text-xs font-bold;
  }

  &__subtotal-sum {
    @apply text-base font-black;
  }
}
</style>
