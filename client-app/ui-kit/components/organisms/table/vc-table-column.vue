<template>
  <!-- Renderless component - slot content is rendered by parent VcTable -->
</template>

<script setup lang="ts">
import { computed, inject, normalizeClass, onBeforeUnmount, onMounted, useAttrs, useSlots, watch } from "vue";
import { vcTableKey } from "./vc-table-context";

/**
 * Declarative column configuration for VcTable with optional scoped slot for cell rendering.
 *
 * This component can be used in two ways:
 *
 * 1. **With scoped slot (recommended for custom cell rendering)**:
 *    The column renders its own cell content via a scoped slot that receives `{ item, index }`.
 *
 * @example
 * <VcTable :items="items" :sort="sort" @headerClick="onSort">
 *   <VcTableColumn id="name" title="Name" sortable v-slot="{ item }">
 *     {{ item.name }}
 *   </VcTableColumn>
 *   <VcTableColumn id="price" title="Price" align="right" v-slot="{ item }">
 *     <strong>{{ formatPrice(item.price) }}</strong>
 *   </VcTableColumn>
 *   <VcTableColumn id="actions" class="w-20" v-slot="{ item }">
 *     <button @click="edit(item)">Edit</button>
 *   </VcTableColumn>
 * </VcTable>
 *
 * 2. **Without scoped slot (for column configuration only)**:
 *    Just registers column metadata, cell rendering is handled by VcTable's desktop-item slot.
 *
 * @example
 * <VcTable :items="items">
 *   <VcTableColumn id="name" title="Name" sortable />
 *   <VcTableColumn id="price" title="Price" align="right" />
 *
 *   <template #desktop-item="{ item }">
 *     <tr>
 *       <td>{{ item.name }}</td>
 *       <td>{{ item.price }}</td>
 *     </tr>
 *   </template>
 * </VcTable>
 */

interface IProps {
  /** Unique identifier for the column */
  id: string;
  /** Column header title */
  title?: string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Text alignment within the column */
  align?: VcTableAlignType;
  /** Column width (e.g., "150px", "20%", "auto"). When set, enables table-layout: fixed for stable column widths. */
  width?: string;
  /**
   * Whether the column is visible. When false, the column unregisters from the parent table
   * but the component stays mounted (watchers remain active). This avoids full mount/unmount
   * cycles compared to using v-if on VcTableColumn.
   * @default true
   */
  visible?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<IProps>(), {
  visible: true,
});
const slots = useSlots();
const attrs = useAttrs();

const tableContext = inject(vcTableKey, null);

const columnData = computed<VcTableColumnType>(() => ({
  id: props.id,
  title: props.title,
  sortable: props.sortable,
  align: props.align,
  classes: attrs.class ? normalizeClass(attrs.class) : undefined,
  width: props.width,
}));

function registerSelf() {
  if (tableContext) {
    tableContext.registerColumn(columnData.value, slots.default, slots.header);
  }
}

function unregisterSelf() {
  if (tableContext) {
    tableContext.unregisterColumn(props.id);
  }
}

onMounted(() => {
  if (props.visible) {
    registerSelf();
  }
});

// Re-register when props change after mount, respecting visibility
watch(columnData, () => {
  if (props.visible) {
    registerSelf();
  }
});

// Watch visibility changes: register when becoming visible, unregister when hidden
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      registerSelf();
    } else {
      unregisterSelf();
    }
  },
);

onBeforeUnmount(() => {
  unregisterSelf();
});
</script>
