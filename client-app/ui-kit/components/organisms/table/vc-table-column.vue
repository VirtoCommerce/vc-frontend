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
}

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<IProps>();
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

onMounted(() => {
  if (tableContext) {
    tableContext.registerColumn(columnData.value, slots.default);
  }
});

// Re-register when props change after mount
watch(columnData, (data) => {
  if (tableContext) {
    tableContext.registerColumn(data, slots.default);
  }
});

onBeforeUnmount(() => {
  if (tableContext) {
    tableContext.unregisterColumn(props.id);
  }
});
</script>
