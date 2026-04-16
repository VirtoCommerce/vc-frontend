import { computed, ref } from "vue";
import { VcBadge } from "@/ui-kit/components/atoms";
import { BREAKPOINTS } from "@/ui-kit/constants";
import { VcTable, VcTableColumn } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const breakpointOptions = ["none", ...Object.keys(BREAKPOINTS)] as const;

interface IVcTableStoryArgs {
  columns?: VcTableColumnType[];
  items?: Array<{ id: number | string; [key: string]: unknown }>;
  sort?: VcTableSortInfoType;
  pages?: number;
  page?: number;
  loading?: boolean;
  hideDefaultHeader?: boolean;
  hideDefaultFooter?: boolean;
  description?: string;
  pageLimit?: number | null;
  mobileBreakpoint?: "none" | BreakpointsType;
  skeletonRows?: number;
  bordered?: boolean;
  mobileBordered?: boolean;
  scrollable?: boolean;
}

const meta: Meta<IVcTableStoryArgs> = {
  title: "Components/Organisms/VcTable",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: VcTable as any,
  argTypes: {
    skeletonRows: {
      control: { type: "number", min: 1, max: 20 },
      type: { name: "number", required: false },
    },
    bordered: {
      control: { type: "boolean" },
      description: "Show border around the table",
    },
    mobileBordered: {
      control: { type: "boolean" },
      description: "Show border around the mobile table",
    },
    scrollable: {
      control: { type: "boolean" },
      type: { name: "boolean", required: false },
    },
    loading: {
      control: { type: "boolean" },
    },
    mobileBreakpoint: {
      control: { type: "select" },
      options: breakpointOptions,
    },
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: '<VcTable v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<IVcTableStoryArgs>;

// Sample data
const sampleItems = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    department: "Engineering",
    phone: "+1 234 567 001",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "Active",
    department: "Marketing",
    phone: "+1 234 567 002",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "Inactive",
    department: "Sales",
    phone: "+1 234 567 003",
  },
  {
    id: 4,
    name: "Alice Williams",
    email: "alice@example.com",
    role: "Moderator",
    status: "Active",
    department: "Support",
    phone: "+1 234 567 004",
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "User",
    status: "Active",
    department: "Engineering",
    phone: "+1 234 567 005",
  },
];

function sortItems<T extends Record<string, unknown>>(items: T[], sort?: VcTableSortInfoType): T[] {
  if (!sort) {
    return items;
  }
  return [...items].sort((a, b) => {
    const aRaw = a[sort.column];
    const bRaw = b[sort.column];
    const aVal = typeof aRaw === "string" || typeof aRaw === "number" ? String(aRaw) : "";
    const bVal = typeof bRaw === "string" || typeof bRaw === "number" ? String(bRaw) : "";
    const cmp = aVal.localeCompare(bVal);
    return sort.direction === "asc" ? cmp : -cmp;
  });
}

const sampleColumns: VcTableColumnType[] = [
  { id: "name", title: "Name", sortable: true },
  { id: "email", title: "Email", sortable: true },
  { id: "role", title: "Role" },
  { id: "status", title: "Status", sortable: true, align: "center" },
];

// =============================================================================
// VcTableColumn API (Recommended)
// =============================================================================

// 1. Default
export const Default: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <VcTableColumn id="name" title="Name" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
          {{ item.status }}
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Recommended approach. Each `VcTableColumn` defines both the header and cell content via its scoped slot.",
      },
      source: {
        code: `
<VcTable :items="items">
  <VcTableColumn id="name" title="Name" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
  <VcTableColumn id="role" title="Role" v-slot="{ item }">
    {{ item.role }}
  </VcTableColumn>
  <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
    {{ item.status }}
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 2. Sorting
export const Sorting: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    sort: { column: "name", direction: "asc" },
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => {
      const sort = ref<VcTableSortInfoType | undefined>(args.sort);
      const sortedItems = computed(() => sortItems(args.items ?? [], sort.value));
      const handleHeaderClick = (sortInfo: VcTableSortInfoType) => {
        sort.value = sortInfo;
      };
      return { args, sort, sortedItems, handleHeaderClick };
    },
    template: `
      <VcTable
        :items="sortedItems"
        :pages="args.pages"
        :page="args.page"
        :sort="sort"
        @header-click="handleHeaderClick"
      >
        <VcTableColumn id="name" title="Name" sortable v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" sortable v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" sortable align="center" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Interactive sorting. Columns with `sortable` prop show sort controls. Click header to toggle direction.",
      },
      source: {
        code: `
<script setup lang="ts">
const sort = ref<VcTableSortInfoType>({ column: "name", direction: "asc" });

function onHeaderClick(sortInfo: VcTableSortInfoType) {
  sort.value = sortInfo;
}
</script>

<template>
  <VcTable :items="items" :sort="sort" @header-click="onHeaderClick">
    <VcTableColumn id="name" title="Name" sortable v-slot="{ item }">
      {{ item.name }}
    </VcTableColumn>
    <VcTableColumn id="status" title="Status" sortable align="center" v-slot="{ item }">
      <VcBadge :color="item.status === 'Active' ? 'success' : 'neutral'" variant="solid-light" size="sm">
        {{ item.status }}
      </VcBadge>
    </VcTableColumn>
  </VcTable>
</template>
        `,
      },
    },
  },
};

// 3. Responsive
export const Responsive: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    mobileBreakpoint: "md",
    bordered: true,
    mobileBordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable
        :items="args.items"
        :pages="args.pages"
        :page="args.page"
        :mobile-breakpoint="args.mobileBreakpoint"
        :bordered="args.bordered"
        :mobile-bordered="args.mobileBordered"
      >
        <template #mobile-item="{ item }">
          <div class="border-b border-neutral-200 p-4 last:border-b-0">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold">{{ item.name }}</span>
              <VcBadge
                :color="item.status === 'Active' ? 'success' : 'neutral'"
                variant="solid-light"
                size="sm"
              >
                {{ item.status }}
              </VcBadge>
            </div>
            <div class="text-sm text-neutral-600">{{ item.email }}</div>
            <div class="text-sm text-neutral-500">{{ item.role }}</div>
          </div>
        </template>

        <VcTableColumn id="name" title="Name" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Responsive table: `VcTableColumn` for desktop, `#mobile-item` slot for mobile. Switches at `mobileBreakpoint`.",
      },
      source: {
        code: `
<VcTable :items="items" mobile-breakpoint="md" bordered mobile-bordered>
  <template #mobile-item="{ item }">
    <div class="border-b border-neutral-200 p-4">
      <span class="font-bold">{{ item.name }}</span>
      <div class="text-sm text-neutral-600">{{ item.email }}</div>
    </div>
  </template>

  <VcTableColumn id="name" title="Name" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 4. Pagination
export const Pagination: StoryType = {
  args: {
    items: sampleItems,
    pages: 5,
    page: 1,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn },
    setup: () => {
      const page = ref(args.page);
      const handlePageChange = (newPage: number) => {
        page.value = newPage;
      };
      return { args, page, handlePageChange };
    },
    template: `
      <VcTable :items="args.items" :pages="args.pages" :page="page" @page-changed="handlePageChange">
        <VcTableColumn id="name" title="Name" v-slot="{ item }">{{ item.name }}</VcTableColumn>
        <VcTableColumn id="email" title="Email" v-slot="{ item }">{{ item.email }}</VcTableColumn>
        <VcTableColumn id="role" title="Role" v-slot="{ item }">{{ item.role }}</VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">{{ item.status }}</VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Pagination with `pages`, `page` props and `@page-changed` event.",
      },
      source: {
        code: `
<script setup lang="ts">
const page = ref(1);
const pages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

async function onPageChange(newPage: number) {
  page.value = newPage;
  await fetchItems();
}
</script>

<template>
  <VcTable :items="items" :pages="pages" :page="page" @page-changed="onPageChange">
    <VcTableColumn id="name" title="Name" v-slot="{ item }">
      {{ item.name }}
    </VcTableColumn>
    <VcTableColumn id="email" title="Email" v-slot="{ item }">
      {{ item.email }}
    </VcTableColumn>
    <VcTableColumn id="role" title="Role" v-slot="{ item }">
      {{ item.role }}
    </VcTableColumn>
    <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
      {{ item.status }}
    </VcTableColumn>
  </VcTable>
</template>
        `,
      },
    },
  },
};

// 5. ColumnAlignment
export const ColumnAlignment: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn },
    setup: () => ({ args }),
    template: `
      <VcTable :items="args.items" :pages="args.pages" :page="args.page" :bordered="args.bordered">
        <VcTableColumn id="name" title="Name (Left)" align="left" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email (Center)" align="center" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role (Right)" align="right" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Column alignment via `align` prop. Applies to both header and cell content.",
      },
      source: {
        code: `
<VcTable :items="items" bordered>
  <VcTableColumn id="name" title="Name" align="left" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" align="center" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
  <VcTableColumn id="role" title="Role" align="right" v-slot="{ item }">
    {{ item.role }}
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 6. ColumnWidths
export const ColumnWidths: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable :items="args.items" :pages="args.pages" :page="args.page" :bordered="args.bordered">
        <VcTableColumn id="name" title="Name" width="200px" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" width="250px" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" width="120px" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center" width="100px" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Fixed column widths via `width` prop. Enables `table-layout: fixed` for stable layout that doesn't shift when content changes.",
      },
      source: {
        code: `
<VcTable :items="items" bordered>
  <VcTableColumn id="name" title="Name" width="200px" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" width="250px" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
  <VcTableColumn id="role" title="Role" width="120px" v-slot="{ item }">
    {{ item.role }}
  </VcTableColumn>
  <VcTableColumn id="status" title="Status" align="center" width="100px" v-slot="{ item }">
    <VcBadge :color="item.status === 'Active' ? 'success' : 'neutral'" variant="solid-light" size="sm">
      {{ item.status }}
    </VcBadge>
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 7. MixedColumnWidths
export const MixedColumnWidths: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable :items="args.items" :pages="args.pages" :page="args.page" :bordered="args.bordered">
        <VcTableColumn id="name" title="Name" width="180px" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center" width="100px" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Mix fixed and flexible widths. Columns without `width` share the remaining space equally.",
      },
      source: {
        code: `
<VcTable :items="items" bordered>
  <VcTableColumn id="name" title="Name" width="180px" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <!-- No width — takes remaining space -->
  <VcTableColumn id="email" title="Email" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
  <VcTableColumn id="status" title="Status" align="center" width="100px" v-slot="{ item }">
    {{ item.status }}
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 8. ConditionalColumns
export const ConditionalColumns: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn },
    setup: () => {
      const showExtended = ref(false);
      return { args, showExtended };
    },
    template: `
      <div>
        <div class="mb-4">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="showExtended" />
            Show extended columns (Department, Phone)
          </label>
        </div>

        <VcTable :items="args.items" :pages="args.pages" :page="args.page" :bordered="args.bordered">
          <VcTableColumn id="name" title="Name" v-slot="{ item }">
            {{ item.name }}
          </VcTableColumn>
          <VcTableColumn id="email" title="Email" v-slot="{ item }">
            {{ item.email }}
          </VcTableColumn>
          <VcTableColumn v-if="showExtended" id="department" title="Department" v-slot="{ item }">
            {{ item.department }}
          </VcTableColumn>
          <VcTableColumn v-if="showExtended" id="phone" title="Phone" v-slot="{ item }">
            {{ item.phone }}
          </VcTableColumn>
          <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
            {{ item.status }}
          </VcTableColumn>
        </VcTable>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Conditional columns with `v-if`. Columns mount/unmount and auto-register/unregister. Similar to `orders.vue` pattern with `orderScope` switching columns.",
      },
      source: {
        code: `
<script setup lang="ts">
const isOrganization = computed(() => orderScope.value === 'organization');
</script>

<template>
  <VcTable :items="items" bordered>
    <VcTableColumn id="number" title="Order #" v-slot="{ item }">
      {{ item.number }}
    </VcTableColumn>
    <VcTableColumn v-if="isOrganization" id="buyer" title="Buyer" v-slot="{ item }">
      {{ item.customerName }}
    </VcTableColumn>
    <VcTableColumn id="status" title="Status" v-slot="{ item }">
      {{ item.status }}
    </VcTableColumn>
  </VcTable>
</template>
        `,
      },
    },
  },
};

// 10. CustomColumnHeader
export const CustomColumnHeader: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable :items="args.items" :pages="args.pages" :page="args.page" :bordered="args.bordered">
        <VcTableColumn id="name" title="Name" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email">
          <template #header="{ column }">
            <span class="text-primary-700 font-bold uppercase">{{ column.title }}</span>
          </template>
          <template #default="{ item }">
            {{ item.email }}
          </template>
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center">
          <template #header>
            <div class="flex items-center justify-center gap-1">
              <span>Status</span>
              <VcBadge color="info" variant="solid-light" size="xs">NEW</VcBadge>
            </div>
          </template>
          <template #default="{ item }">
            <VcBadge
              :color="item.status === 'Active' ? 'success' : 'neutral'"
              variant="solid-light"
              size="sm"
            >
              {{ item.status }}
            </VcBadge>
          </template>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Custom header rendering via `#header` slot on VcTableColumn. Receives `{ column }` scope with column metadata.",
      },
      source: {
        code: `
<VcTable :items="items" bordered>
  <VcTableColumn id="name" title="Name" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="status" title="Status" align="center">
    <template #header>
      <div class="flex items-center gap-1">
        <span>Status</span>
        <VcBadge color="info" variant="solid-light" size="xs">NEW</VcBadge>
      </div>
    </template>
    <template #default="{ item }">
      <VcBadge
        :color="item.status === 'Active' ? 'success' : 'neutral'"
        variant="solid-light"
        size="sm"
      >
        {{ item.status }}
      </VcBadge>
    </template>
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 11. RowClick
export const RowClick: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn },
    setup: () => {
      const lastClicked = ref<string>("None");
      const handleRowClick = (item: Record<string, unknown>) => {
        lastClicked.value = String(item.name);
      };
      return { args, lastClicked, handleRowClick };
    },
    template: `
      <div>
        <div class="mb-4 p-3 bg-neutral-100 rounded text-sm">
          Last clicked: <strong>{{ lastClicked }}</strong>
        </div>

        <VcTable
          :items="args.items"
          :pages="args.pages"
          :page="args.page"
          :bordered="args.bordered"
          @row-click="handleRowClick"
        >
          <VcTableColumn id="name" title="Name" v-slot="{ item }">
            {{ item.name }}
          </VcTableColumn>
          <VcTableColumn id="email" title="Email" v-slot="{ item }">
            {{ item.email }}
          </VcTableColumn>
          <VcTableColumn id="role" title="Role" v-slot="{ item }">
            {{ item.role }}
          </VcTableColumn>
        </VcTable>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Row click using `@row-click` on VcTable. Automatically adds `cursor-pointer` and `role="button"` to each row.',
      },
      source: {
        code: `
<VcTable :items="items" bordered @row-click="onRowClick">
  <VcTableColumn id="name" title="Name" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 12. RowStyling
export const RowStyling: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => {
      const rowClass = (item: Record<string, unknown>) => ({
        "bg-danger-50": item.status === "Inactive",
      });
      return { args, rowClass };
    },
    template: `
      <VcTable
        :items="args.items"
        :pages="args.pages"
        :page="args.page"
        :bordered="args.bordered"
        :row-class="rowClass"
      >
        <VcTableColumn id="name" title="Name" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Dynamic row styling using `row-class` prop on VcTable. Returns class bindings for each row `<tr>`.",
      },
      source: {
        code: `
<script setup lang="ts">
const rowClass = (item) => ({
  'bg-danger-50': item.status === 'Inactive',
});
</script>

<template>
  <VcTable :items="items" :row-class="rowClass" bordered>
    <VcTableColumn id="name" title="Name" v-slot="{ item }">
      {{ item.name }}
    </VcTableColumn>
    <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
      <VcBadge
        :color="item.status === 'Active' ? 'success' : 'neutral'"
        variant="solid-light"
        size="sm"
      >
        {{ item.status }}
      </VcBadge>
    </VcTableColumn>
  </VcTable>
</template>
        `,
      },
    },
  },
};

// 13. RowInlineStyle
export const RowInlineStyle: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => {
      const rowStyle = (item: Record<string, unknown>) => ({
        opacity: item.status === "Inactive" ? "0.5" : "1",
      });
      return { args, rowStyle };
    },
    template: `
      <VcTable
        :items="args.items"
        :pages="args.pages"
        :page="args.page"
        :bordered="args.bordered"
        :row-style="rowStyle"
      >
        <VcTableColumn id="name" title="Name" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Dynamic row inline styling using `row-style` prop on VcTable. Returns style bindings for each row `<tr>`.",
      },
      source: {
        code: `
<script setup lang="ts">
const rowStyle = (item) => ({
  opacity: item.status === 'Inactive' ? '0.5' : '1',
});
</script>

<template>
  <VcTable :items="items" :row-style="rowStyle" bordered>
    <VcTableColumn id="name" title="Name" v-slot="{ item }">
      {{ item.name }}
    </VcTableColumn>
    <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
      <VcBadge
        :color="item.status === 'Active' ? 'success' : 'neutral'"
        variant="solid-light"
        size="sm"
      >
        {{ item.status }}
      </VcBadge>
    </VcTableColumn>
  </VcTable>
</template>
        `,
      },
    },
  },
};

// 14. Loading
export const Loading: StoryType = {
  args: {
    items: [],
    pages: 1,
    page: 1,
    loading: true,
    skeletonRows: 5,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn },
    setup: () => ({ args }),
    template: `
      <VcTable
        :items="args.items"
        :pages="args.pages"
        :page="args.page"
        :loading="args.loading"
        :skeleton-rows="args.skeletonRows"
        :bordered="args.bordered"
      >
        <VcTableColumn id="name" title="Name" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
          {{ item.status }}
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Loading skeleton. Column count is derived from VcTableColumn children — skeleton cells match the number of declared columns.",
      },
      source: {
        code: `
<VcTable :items="[]" :loading="true" :skeleton-rows="5" bordered>
  <VcTableColumn id="name" title="Name" v-slot="{ item }">{{ item.name }}</VcTableColumn>
  <VcTableColumn id="email" title="Email" v-slot="{ item }">{{ item.email }}</VcTableColumn>
  <VcTableColumn id="role" title="Role" v-slot="{ item }">{{ item.role }}</VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 14. Empty
export const Empty: StoryType = {
  args: {
    items: [],
    pages: 0,
    page: 0,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn },
    setup: () => ({ args }),
    template: `
      <VcTable :items="args.items" :pages="args.pages" :page="args.page" :bordered="args.bordered">
        <VcTableColumn id="name" title="Name" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" v-slot="{ item }">
          {{ item.status }}
        </VcTableColumn>

        <template #desktop-empty>
          <tr>
            <td colspan="3" class="p-10 text-center text-neutral-500">
              No items available
            </td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Empty state with `#desktop-empty` slot. VcTableColumn still defines headers for context.",
      },
      source: {
        code: `
<VcTable :items="[]" bordered>
  <VcTableColumn id="name" title="Name" v-slot="{ item }">{{ item.name }}</VcTableColumn>
  <VcTableColumn id="email" title="Email" v-slot="{ item }">{{ item.email }}</VcTableColumn>

  <template #desktop-empty>
    <tr>
      <td colspan="2" class="p-10 text-center text-neutral-500">
        No items available
      </td>
    </tr>
  </template>
</VcTable>
        `,
      },
    },
  },
};

// 15. Bordered
export const Bordered: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn },
    setup: () => ({ args }),
    template: `
      <VcTable :items="args.items" :pages="args.pages" :page="args.page" :bordered="args.bordered">
        <VcTableColumn id="name" title="Name" v-slot="{ item }">{{ item.name }}</VcTableColumn>
        <VcTableColumn id="email" title="Email" v-slot="{ item }">{{ item.email }}</VcTableColumn>
        <VcTableColumn id="role" title="Role" v-slot="{ item }">{{ item.role }}</VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">{{ item.status }}</VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Bordered table using `bordered` prop.",
      },
      source: {
        code: `
<VcTable :items="items" bordered>
  <VcTableColumn id="name" title="Name" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
  <VcTableColumn id="role" title="Role" v-slot="{ item }">
    {{ item.role }}
  </VcTableColumn>
  <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
    {{ item.status }}
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 16. Scrollable
export const Scrollable: StoryType = {
  args: {
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
    scrollable: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <div class="max-w-2xl">
        <VcTable
          :items="args.items"
          :pages="args.pages"
          :page="args.page"
          :bordered="args.bordered"
          :scrollable="args.scrollable"
        >
          <VcTableColumn id="name" title="Name" class="min-w-52" v-slot="{ item }">
            {{ item.name }}
          </VcTableColumn>
          <VcTableColumn id="email" title="Email" class="min-w-64" v-slot="{ item }">
            {{ item.email }}
          </VcTableColumn>
          <VcTableColumn id="role" title="Role" class="min-w-40" v-slot="{ item }">
            {{ item.role }}
          </VcTableColumn>
          <VcTableColumn id="status" title="Status" align="center" class="min-w-32" v-slot="{ item }">
            <VcBadge
              :color="item.status === 'Active' ? 'success' : 'neutral'"
              variant="solid-light"
              size="sm"
            >
              {{ item.status }}
            </VcBadge>
          </VcTableColumn>
          <VcTableColumn id="department" title="Department" class="min-w-48" v-slot="{ item }">
            {{ item.department }}
          </VcTableColumn>
          <VcTableColumn id="phone" title="Phone" class="min-w-36" v-slot="{ item }">
            {{ item.phone }}
          </VcTableColumn>
        </VcTable>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Horizontal scrolling with `scrollable` prop when table overflows its container. Min-widths set via `class` on VcTableColumn.",
      },
      source: {
        code: `
<div class="max-w-2xl">
  <VcTable :items="items" bordered scrollable>
    <VcTableColumn id="name" title="Name" class="min-w-52" v-slot="{ item }">
      {{ item.name }}
    </VcTableColumn>
    <VcTableColumn id="email" title="Email" class="min-w-64" v-slot="{ item }">
      {{ item.email }}
    </VcTableColumn>
    <!-- ... more columns -->
  </VcTable>
</div>
        `,
      },
    },
  },
};

// 17. StickyHeader
const manySampleItems = Array.from({ length: 10 }, (_, batch) =>
  sampleItems.map((item) => ({ ...item, id: item.id + batch * 100 })),
).flat();

export const StickyHeaderContainer: StoryType = {
  args: {
    items: manySampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable
        :items="args.items"
        :pages="args.pages"
        :page="args.page"
        :bordered="args.bordered"
        max-height="300px"
      >
        <VcTableColumn id="name" title="Name" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Sticky header with `max-height`. The table body scrolls within a fixed-height container while the header stays pinned at the top.",
      },
      source: {
        code: `
<VcTable :items="items" max-height="300px" bordered>
  <VcTableColumn id="name" title="Name" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

export const StickyHeaderViewport: StoryType = {
  args: {
    items: manySampleItems,
    pages: 1,
    page: 1,
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <div>
        <div class="mb-4 p-3 bg-neutral-100 rounded text-sm">
          Scroll the page down — the header sticks to the top of the viewport.
        </div>

        <VcTable
          :items="args.items"
          :pages="args.pages"
          :page="args.page"
          :bordered="args.bordered"
          sticky-header
        >
          <VcTableColumn id="name" title="Name" v-slot="{ item }">
            {{ item.name }}
          </VcTableColumn>
          <VcTableColumn id="email" title="Email" v-slot="{ item }">
            {{ item.email }}
          </VcTableColumn>
          <VcTableColumn id="role" title="Role" v-slot="{ item }">
            {{ item.role }}
          </VcTableColumn>
          <VcTableColumn id="status" title="Status" align="center" v-slot="{ item }">
            <VcBadge
              :color="item.status === 'Active' ? 'success' : 'neutral'"
              variant="solid-light"
              size="sm"
            >
              {{ item.status }}
            </VcBadge>
          </VcTableColumn>
        </VcTable>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Sticky header with `sticky-header` prop (no `max-height`). The header sticks to the top of the viewport as the page scrolls.",
      },
      source: {
        code: `
<VcTable :items="items" sticky-header bordered>
  <VcTableColumn id="name" title="Name" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

export const StickyColumn: StoryType = {
  args: {
    items: manySampleItems.slice(0, 10),
    pages: 1,
    page: 1,
    bordered: true,
    scrollable: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable
        :items="args.items"
        :pages="args.pages"
        :page="args.page"
        :bordered="args.bordered"
        :scrollable="args.scrollable"
      >
        <VcTableColumn id="name" title="Name" fixed="start" width="150px" v-slot="{ item }">
          <span class="font-medium whitespace-nowrap">{{ item.name }}</span>
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" width="250px" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" width="180px" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="department" title="Department" width="200px" v-slot="{ item }">
          {{ item.department }}
        </VcTableColumn>
        <VcTableColumn id="phone" title="Phone" width="200px" v-slot="{ item }">
          {{ item.phone }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" fixed="end" width="120px" align="center" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Single sticky column on each side. Name pinned start, Status pinned end — scroll horizontally to see them stay in place.",
      },
      source: {
        code: `
<VcTable :items="items" bordered scrollable>
  <VcTableColumn id="name" title="Name" fixed="start" width="150px" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" width="250px" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
  <!-- ... more columns ... -->
  <VcTableColumn id="status" title="Status" fixed="end" width="120px" align="center" v-slot="{ item }">
    <VcBadge
      :color="item.status === 'Active' ? 'success' : 'neutral'"
      variant="solid-light"
      size="sm"
    >
      {{ item.status }}
    </VcBadge>
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

export const StickyColumnsMultiple: StoryType = {
  args: {
    items: manySampleItems.slice(0, 10),
    pages: 1,
    page: 1,
    bordered: true,
    scrollable: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable
        :items="args.items"
        :pages="args.pages"
        :page="args.page"
        :bordered="args.bordered"
        :scrollable="args.scrollable"
      >
        <VcTableColumn id="name" title="Name" fixed="start" width="150px" v-slot="{ item }">
          <span class="font-medium whitespace-nowrap">{{ item.name }}</span>
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" fixed="start" width="200px" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="department" title="Department" width="200px" v-slot="{ item }">
          {{ item.department }}
        </VcTableColumn>
        <VcTableColumn id="phone" title="Phone" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.phone }}
        </VcTableColumn>
        <VcTableColumn id="role2" title="Role (copy)" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="department2" title="Department (copy)" width="200px" v-slot="{ item }">
          {{ item.department }}
        </VcTableColumn>
        <VcTableColumn id="phone2" title="Phone (copy)" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.phone }}
        </VcTableColumn>
        <VcTableColumn id="email2" title="Email (copy)" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="name2" title="Name (copy)" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" fixed="end" width="120px" align="center" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Multiple sticky columns on the start side. Name and Email are both pinned start with cumulative offsets. Status pinned end.",
      },
      source: {
        code: `
<VcTable :items="items" bordered scrollable>
  <!-- Both pinned start — offsets calculated automatically -->
  <VcTableColumn id="name" title="Name" fixed="start" width="150px" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" fixed="start" width="200px" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
  <!-- Scrollable columns -->
  <VcTableColumn id="role" title="Role" width="180px" v-slot="{ item }">
    {{ item.role }}
  </VcTableColumn>
  <!-- ... -->
  <VcTableColumn id="status" title="Status" fixed="end" width="120px" v-slot="{ item }">
    {{ item.status }}
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 18. StickyColumnReorder — fixed column in the middle is auto-reordered to the edge
export const StickyColumnReorder: StoryType = {
  args: {
    items: manySampleItems.slice(0, 5),
    pages: 1,
    page: 1,
    bordered: true,
    scrollable: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable
        :items="args.items"
        :pages="args.pages"
        :page="args.page"
        :bordered="args.bordered"
        :scrollable="args.scrollable"
      >
        <VcTableColumn id="name" title="Name" class="whitespace-nowrap" v-slot="{ item }">
          <span class="font-medium">{{ item.name }}</span>
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" fixed="start" width="120px" align="center" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="department" title="Department" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.department }}
        </VcTableColumn>
        <VcTableColumn id="phone" title="Phone" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.phone }}
        </VcTableColumn>
        <VcTableColumn id="phone2" title="Phone (copy)" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.phone }}
        </VcTableColumn>
        <VcTableColumn id="email2" title="Email (copy)" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="name2" title="Name (copy)" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.name }}
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Status column is declared 3rd in the template but has `fixed="start"`. It is automatically reordered to the start edge of the table. This demonstrates that fixed columns are always moved to their respective edge regardless of template position.',
      },
      source: {
        code: `
<!-- Status is declared 3rd but rendered 1st (auto-reordered to start edge) -->
<VcTable :items="items" bordered scrollable>
  <VcTableColumn id="name" title="Name" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
  <!-- This column will be moved to the start edge automatically -->
  <VcTableColumn id="status" title="Status" fixed="start" width="120px" align="center" v-slot="{ item }">
    <VcBadge :color="item.status === 'Active' ? 'success' : 'neutral'" variant="solid-light" size="sm">
      {{ item.status }}
    </VcBadge>
  </VcTableColumn>
  <VcTableColumn id="role" title="Role" v-slot="{ item }">
    {{ item.role }}
  </VcTableColumn>
  <!-- ... more columns ... -->
</VcTable>
        `,
      },
    },
  },
};

// 19. StickyHeaderAndColumns — sticky header + sticky columns combined
export const StickyHeaderAndColumns: StoryType = {
  args: {
    items: manySampleItems,
    pages: 1,
    page: 1,
    bordered: true,
    scrollable: true,
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable
        :items="args.items"
        :pages="args.pages"
        :page="args.page"
        :bordered="args.bordered"
        :scrollable="args.scrollable"
        max-height="400px"
      >
        <VcTableColumn id="name" title="Name" fixed="start" width="150px" v-slot="{ item }">
          <span class="font-medium whitespace-nowrap">{{ item.name }}</span>
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" fixed="start" width="200px" v-slot="{ item }">
          <span class="whitespace-nowrap">{{ item.email }}</span>
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="department" title="Department" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.department }}
        </VcTableColumn>
        <VcTableColumn id="phone" title="Phone" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.phone }}
        </VcTableColumn>
        <VcTableColumn id="role2" title="Role (copy)" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.role }}
        </VcTableColumn>
        <VcTableColumn id="department2" title="Department (copy)" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.department }}
        </VcTableColumn>
        <VcTableColumn id="phone2" title="Phone (copy)" class="whitespace-nowrap" v-slot="{ item }">
          {{ item.phone }}
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" fixed="end" width="120px" align="center" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Combines sticky columns (horizontal) with sticky header (vertical) via `max-height`. Both scroll directions work independently — the header stays visible when scrolling down, and fixed columns stay visible when scrolling right.",
      },
      source: {
        code: `
<VcTable :items="items" bordered scrollable max-height="400px">
  <VcTableColumn id="name" title="Name" fixed="start" width="150px" v-slot="{ item }">
    {{ item.name }}
  </VcTableColumn>
  <VcTableColumn id="email" title="Email" fixed="start" width="200px" v-slot="{ item }">
    {{ item.email }}
  </VcTableColumn>
  <!-- Scrollable columns -->
  <VcTableColumn id="role" title="Role" v-slot="{ item }">
    {{ item.role }}
  </VcTableColumn>
  <!-- ... -->
  <VcTableColumn id="status" title="Status" fixed="end" width="120px" v-slot="{ item }">
    {{ item.status }}
  </VcTableColumn>
</VcTable>
        `,
      },
    },
  },
};

// 20. FullExample
export const FullExample: StoryType = {
  args: {
    items: sampleItems,
    pages: 5,
    page: 1,
    sort: { column: "name", direction: "asc" },
    bordered: true,
    mobileBordered: true,
    mobileBreakpoint: "md",
  },
  render: (args) => ({
    components: { VcTable, VcTableColumn, VcBadge },
    setup: () => {
      const page = ref(args.page);
      const sort = ref<VcTableSortInfoType | undefined>(args.sort);
      const sortedItems = computed(() => sortItems(args.items ?? [], sort.value));

      const handlePageChange = (newPage: number) => {
        page.value = newPage;
      };

      const handleHeaderClick = (sortInfo: VcTableSortInfoType) => {
        sort.value = sortInfo;
      };

      const handleRowClick = (item: Record<string, unknown>) => {
        alert(`Clicked: ${item.name}`);
      };

      return { args, page, sort, sortedItems, handlePageChange, handleHeaderClick, handleRowClick };
    },
    template: `
      <VcTable
        :items="sortedItems"
        :pages="args.pages"
        :page="page"
        :sort="sort"
        :bordered="args.bordered"
        :mobile-bordered="args.mobileBordered"
        :mobile-breakpoint="args.mobileBreakpoint"
        :row-class="(item) => ({ 'bg-danger-50': item.status === 'Inactive' })"
        @page-changed="handlePageChange"
        @header-click="handleHeaderClick"
        @row-click="handleRowClick"
      >
        <template #mobile-item="{ item }">
          <div class="border-b border-neutral-200 p-4 last:border-b-0">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold">{{ item.name }}</span>
              <VcBadge
                :color="item.status === 'Active' ? 'success' : 'neutral'"
                variant="solid-light"
                size="sm"
              >
                {{ item.status }}
              </VcBadge>
            </div>
            <div class="text-sm text-neutral-600">{{ item.email }}</div>
            <div class="text-sm text-neutral-500">{{ item.role }}</div>
          </div>
        </template>

        <VcTableColumn id="name" title="Name" sortable v-slot="{ item }">
          <div class="flex items-center gap-2">
            <div class="size-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">
              {{ item.name.charAt(0) }}
            </div>
            {{ item.name }}
          </div>
        </VcTableColumn>
        <VcTableColumn id="email" title="Email" sortable v-slot="{ item }">
          {{ item.email }}
        </VcTableColumn>
        <VcTableColumn id="role" title="Role" v-slot="{ item }">
          <VcBadge color="neutral" variant="solid-light" size="sm">
            {{ item.role }}
          </VcBadge>
        </VcTableColumn>
        <VcTableColumn id="status" title="Status" sortable align="center" v-slot="{ item }">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </VcTableColumn>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Kitchen sink: sorting, pagination, mobile view, bordered, badges, row click, row styling — all features combined.",
      },
      source: {
        code: `
<script setup lang="ts">
const page = ref(1);
const sort = ref<VcTableSortInfoType>({ column: "name", direction: "asc" });

function goToDetails(item) {
  router.push(\`/details/\${item.id}\`);
}
</script>

<template>
  <VcTable
    :items="items"
    :pages="5"
    :page="page"
    :sort="sort"
    :row-class="(item) => ({ 'bg-danger-50': item.status === 'Inactive' })"
    bordered
    mobile-bordered
    mobile-breakpoint="md"
    @page-changed="page = $event"
    @header-click="sort = $event"
    @row-click="goToDetails"
  >
    <template #mobile-item="{ item }">
      <div class="border-b p-4">
        <span class="font-bold">{{ item.name }}</span>
        <VcBadge :color="item.status === 'Active' ? 'success' : 'neutral'" variant="solid-light" size="sm">
          {{ item.status }}
        </VcBadge>
      </div>
    </template>

    <VcTableColumn id="name" title="Name" sortable v-slot="{ item }">
      {{ item.name }}
    </VcTableColumn>
    <VcTableColumn id="email" title="Email" sortable v-slot="{ item }">
      {{ item.email }}
    </VcTableColumn>
    <VcTableColumn id="role" title="Role" v-slot="{ item }">
      <VcBadge color="neutral" variant="solid-light" size="sm">{{ item.role }}</VcBadge>
    </VcTableColumn>
    <VcTableColumn id="status" title="Status" sortable align="center" v-slot="{ item }">
      <VcBadge :color="item.status === 'Active' ? 'success' : 'neutral'" variant="solid-light" size="sm">
        {{ item.status }}
      </VcBadge>
    </VcTableColumn>
  </VcTable>
</template>
        `,
      },
    },
  },
};

// =============================================================================
// Slots API (Alternative approach)
// =============================================================================

// 19. SlotsApiDefault
export const SlotsApiDefault: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 1,
    page: 1,
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <template #desktop-body>
          <tr
            v-for="item in args.items"
            :key="item.id"
            class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
          >
            <td class="p-5">{{ item.name }}</td>
            <td class="p-5">{{ item.email }}</td>
            <td class="p-5">{{ item.role }}</td>
            <td class="p-5 text-center">{{ item.status }}</td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "**Slots API.** Alternative approach using `columns` prop and `#desktop-body` template slot for full row control.",
      },
      source: {
        code: `
<script setup lang="ts">
const columns: VcTableColumnType[] = [
  { id: "name", title: "Name", sortable: true },
  { id: "email", title: "Email", sortable: true },
  { id: "role", title: "Role" },
  { id: "status", title: "Status", sortable: true, align: "center" },
];

const items = ref([
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
  // ...
]);
</script>

<template>
  <VcTable :columns="columns" :items="items" :pages="1" :page="1">
    <template #desktop-body>
      <tr
        v-for="item in items"
        :key="item.id"
        class="even:bg-neutral-50 hover:bg-neutral-200"
      >
        <td class="p-5">{{ item.name }}</td>
        <td class="p-5">{{ item.email }}</td>
        <td class="p-5">{{ item.role }}</td>
        <td class="p-5 text-center">{{ item.status }}</td>
      </tr>
    </template>
  </VcTable>
</template>
        `,
      },
    },
  },
};

// 20. SlotsApiDesktopItem
export const SlotsApiDesktopItem: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 1,
    page: 1,
  },
  render: (args) => ({
    components: { VcTable, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <template #mobile-item="{ item }">
          <div class="border-b border-neutral-200 p-4 last:border-b-0">
            <div class="flex items-center gap-3 mb-2">
              <div class="size-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {{ item.name.charAt(0) }}
              </div>
              <div>
                <div class="font-bold">{{ item.name }}</div>
                <div class="text-sm text-neutral-500">{{ item.email }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <VcBadge color="neutral" variant="solid-light" size="sm">
                {{ item.role }}
              </VcBadge>
              <VcBadge
                :color="item.status === 'Active' ? 'success' : 'neutral'"
                variant="solid-light"
                size="sm"
              >
                {{ item.status }}
              </VcBadge>
            </div>
          </div>
        </template>

        <template #desktop-item="{ item }">
          <tr class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200">
            <td class="p-5">
              <div class="flex items-center gap-2">
                <div class="size-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">
                  {{ item.name.charAt(0) }}
                </div>
                {{ item.name }}
              </div>
            </td>
            <td class="p-5">{{ item.email }}</td>
            <td class="p-5">
              <VcBadge color="neutral" variant="solid-light" size="sm">
                {{ item.role }}
              </VcBadge>
            </td>
            <td class="p-5 text-center">
              <VcBadge
                :color="item.status === 'Active' ? 'success' : 'neutral'"
                variant="solid-light"
                size="sm"
              >
                {{ item.status }}
              </VcBadge>
            </td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "**Slots API.** Using `#mobile-item` and `#desktop-item` scoped slots. The component iterates over items internally and passes each item to the slot.",
      },
      source: {
        code: `
<VcTable :columns="columns" :items="items">
  <!-- Mobile: component iterates, you render one item -->
  <template #mobile-item="{ item }">
    <div class="border-b p-4">
      <div class="flex items-center gap-3">
        <div class="size-10 rounded-full bg-primary-100">
          {{ item.name.charAt(0) }}
        </div>
        <div>
          <div class="font-bold">{{ item.name }}</div>
          <div class="text-sm text-neutral-500">{{ item.email }}</div>
        </div>
      </div>
      <div class="flex gap-2 mt-2">
        <VcBadge color="neutral" variant="solid-light" size="sm">
          {{ item.role }}
        </VcBadge>
        <VcBadge
          :color="item.status === 'Active' ? 'success' : 'neutral'"
          variant="solid-light"
          size="sm"
        >
          {{ item.status }}
        </VcBadge>
      </div>
    </div>
  </template>

  <!-- Desktop: component iterates, you render one row -->
  <template #desktop-item="{ item }">
    <tr class="even:bg-neutral-50 hover:bg-neutral-200">
      <td class="p-5">
        <div class="flex items-center gap-2">
          <div class="size-8 rounded-full bg-primary-100">
            {{ item.name.charAt(0) }}
          </div>
          {{ item.name }}
        </div>
      </td>
      <td class="p-5">{{ item.email }}</td>
      <td class="p-5">
        <VcBadge color="neutral" variant="solid-light" size="sm">
          {{ item.role }}
        </VcBadge>
      </td>
      <td class="p-5 text-center">
        <VcBadge :color="item.status === 'Active' ? 'success' : 'neutral'" ...>
          {{ item.status }}
        </VcBadge>
      </td>
    </tr>
  </template>
</VcTable>
        `,
      },
    },
  },
};

// 21. SlotsApiResponsive
export const SlotsApiResponsive: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 1,
    page: 1,
    mobileBreakpoint: "md",
  },
  render: (args) => ({
    components: { VcTable, VcBadge },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <template #mobile-item="{ item }">
          <div class="border-b border-neutral-200 p-4 last:border-b-0">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold">{{ item.name }}</span>
              <VcBadge
                :color="item.status === 'Active' ? 'success' : 'neutral'"
                variant="solid-light"
                size="sm"
              >
                {{ item.status }}
              </VcBadge>
            </div>
            <div class="text-sm text-neutral-600">{{ item.email }}</div>
            <div class="text-sm text-neutral-500">{{ item.role }}</div>
          </div>
        </template>

        <template #desktop-body>
          <tr
            v-for="item in args.items"
            :key="item.id"
            class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
          >
            <td class="p-5">{{ item.name }}</td>
            <td class="p-5">{{ item.email }}</td>
            <td class="p-5">{{ item.role }}</td>
            <td class="p-5 text-center">{{ item.status }}</td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "**Slots API.** Mobile view with `mobile-item` slot. Table switches to mobile view when screen width is less than the `mobileBreakpoint`.",
      },
      source: {
        code: `
<script setup lang="ts">
interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const columns: VcTableColumnType[] = [
  { id: "name", title: "Name", sortable: true },
  { id: "email", title: "Email", sortable: true },
  { id: "role", title: "Role" },
  { id: "status", title: "Status", sortable: true, align: "center" },
];

const items = ref<IUser[]>([...]);
</script>

<template>
  <VcTable
    :columns="columns"
    :items="items"
    :pages="1"
    :page="1"
    mobile-breakpoint="md"
  >
    <template #mobile-item="{ item }">
      <div class="border-b border-neutral-200 p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="font-bold">{{ item.name }}</span>
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </div>
        <div class="text-sm text-neutral-600">{{ item.email }}</div>
        <div class="text-sm text-neutral-500">{{ item.role }}</div>
      </div>
    </template>

    <template #desktop-body>
      <tr v-for="item in items" :key="item.id" class="even:bg-neutral-50">
        <td class="p-5">{{ item.name }}</td>
        <td class="p-5">{{ item.email }}</td>
        <td class="p-5">{{ item.role }}</td>
        <td class="p-5 text-center">{{ item.status }}</td>
      </tr>
    </template>
  </VcTable>
</template>
        `,
      },
    },
  },
};

// 22. SlotsApiSorting
export const SlotsApiSorting: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 1,
    page: 1,
    sort: { column: "name", direction: "asc" },
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => {
      const sort = ref<VcTableSortInfoType | undefined>(args.sort);
      const sortedItems = computed(() => sortItems(args.items ?? [], sort.value));
      const handleHeaderClick = (sortInfo: VcTableSortInfoType) => {
        sort.value = sortInfo;
      };
      return { args, sort, sortedItems, handleHeaderClick };
    },
    template: `
      <VcTable
        v-bind="args"
        :items="sortedItems"
        :sort="sort"
        @header-click="handleHeaderClick"
      >
        <template #desktop-body>
          <tr
            v-for="item in sortedItems"
            :key="item.id"
            class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
          >
            <td class="p-5">{{ item.name }}</td>
            <td class="p-5">{{ item.email }}</td>
            <td class="p-5">{{ item.role }}</td>
            <td class="p-5 text-center">{{ item.status }}</td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "**Slots API.** Sorting with `columns` prop and `#desktop-body` slot. Sort state managed externally via `@header-click`.",
      },
      source: {
        code: `
<script setup lang="ts">
const sort = ref<VcTableSortInfoType>({ column: "name", direction: "asc" });
const sortedItems = computed(() => sortItems(items.value, sort.value));

function onHeaderClick(sortInfo: VcTableSortInfoType) {
  sort.value = sortInfo;
  // Fetch sorted data...
}
</script>

<template>
  <VcTable
    :columns="columns"
    :items="sortedItems"
    :sort="sort"
    @header-click="onHeaderClick"
  >
    <template #desktop-body>
      <tr v-for="item in sortedItems" :key="item.id">
        <td class="p-5">{{ item.name }}</td>
        <!-- ... -->
      </tr>
    </template>
  </VcTable>
</template>
        `,
      },
    },
  },
};

// 23. SlotsApiCustomSkeleton
export const SlotsApiCustomSkeleton: StoryType = {
  args: {
    columns: sampleColumns,
    items: [],
    pages: 1,
    page: 1,
    loading: true,
    skeletonRows: 5,
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <template #desktop-skeleton>
          <tr v-for="i in args.skeletonRows" :key="i" class="even:bg-neutral-50">
            <td class="p-5">
              <div class="h-6 animate-pulse bg-success-200 rounded"></div>
            </td>
            <td class="p-5">
              <div class="h-6 animate-pulse bg-primary-200 rounded"></div>
            </td>
            <td class="p-5">
              <div class="h-6 animate-pulse bg-warning-200 rounded"></div>
            </td>
            <td class="p-5">
              <div class="h-6 animate-pulse bg-danger-200 rounded"></div>
            </td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "**Slots API.** Custom skeleton using `#desktop-skeleton` slot for branded loading states.",
      },
      source: {
        code: `
<VcTable :columns="columns" :loading="true" :skeleton-rows="5">
  <template #desktop-skeleton>
    <tr v-for="i in 5" :key="i" class="even:bg-neutral-50">
      <td class="p-5">
        <div class="h-6 animate-pulse bg-success-200 rounded" />
      </td>
      <td class="p-5">
        <div class="h-6 animate-pulse bg-primary-200 rounded" />
      </td>
      <!-- ... -->
    </tr>
  </template>
</VcTable>
        `,
      },
    },
  },
};

// 24. SlotsApiCustomHeader
export const SlotsApiCustomHeader: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 1,
    page: 1,
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <template #header>
          <thead class="vc-table__head">
            <tr>
              <th colspan="4" class="px-4 py-3 text-left font-bold text-primary-700 bg-primary-50">
                Custom Header - User List
              </th>
            </tr>
            <tr>
              <th class="px-4 py-2 font-medium">Name</th>
              <th class="px-4 py-2 font-medium">Email</th>
              <th class="px-4 py-2 font-medium">Role</th>
              <th class="px-4 py-2 font-medium text-center">Status</th>
            </tr>
          </thead>
        </template>
        <template #desktop-body>
          <tr
            v-for="item in args.items"
            :key="item.id"
            class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
          >
            <td class="p-5">{{ item.name }}</td>
            <td class="p-5">{{ item.email }}</td>
            <td class="p-5">{{ item.role }}</td>
            <td class="p-5 text-center">{{ item.status }}</td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "**Slots API.** Full `#header` slot replacement for completely custom header markup.",
      },
      source: {
        code: `
<VcTable :columns="columns" :items="items">
  <template #header>
    <thead class="vc-table__head">
      <tr>
        <th colspan="4" class="px-4 py-3 text-left font-bold text-primary-600 bg-primary-50">
          Custom Header - User List
        </th>
      </tr>
      <tr>
        <th class="px-4 py-2 font-medium">Name</th>
        <th class="px-4 py-2 font-medium">Email</th>
        <th class="px-4 py-2 font-medium">Role</th>
        <th class="px-4 py-2 font-medium text-center">Status</th>
      </tr>
    </thead>
  </template>

  <template #desktop-body>
    <tr v-for="item in items" :key="item.id" class="even:bg-neutral-50">
      <td class="p-5">{{ item.name }}</td>
      <td class="p-5">{{ item.email }}</td>
      <td class="p-5">{{ item.role }}</td>
      <td class="p-5 text-center">{{ item.status }}</td>
    </tr>
  </template>
</VcTable>
        `,
      },
    },
  },
};

// 25. SlotsApiWithoutHeader
export const SlotsApiWithoutHeader: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 1,
    page: 1,
    hideDefaultHeader: true,
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <template #desktop-body>
          <tr
            v-for="item in args.items"
            :key="item.id"
            class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
          >
            <td class="p-5">{{ item.name }}</td>
            <td class="p-5">{{ item.email }}</td>
            <td class="p-5">{{ item.role }}</td>
            <td class="p-5 text-center">{{ item.status }}</td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "**Slots API.** Table without header using `hide-default-header` prop.",
      },
      source: {
        code: `
<VcTable :columns="columns" :items="items" hide-default-header>
  <template #desktop-body>
    <tr v-for="item in items" :key="item.id" class="even:bg-neutral-50">
      <td class="p-5">{{ item.name }}</td>
      <td class="p-5">{{ item.email }}</td>
      <td class="p-5">{{ item.role }}</td>
      <td class="p-5 text-center">{{ item.status }}</td>
    </tr>
  </template>
</VcTable>
        `,
      },
    },
  },
};

// 26. SlotsApiScrollable
const wideColumns: VcTableColumnType[] = [
  { id: "name", title: "Name", sortable: true, classes: "min-w-52" },
  { id: "email", title: "Email", sortable: true, classes: "min-w-64" },
  { id: "role", title: "Role", classes: "min-w-40" },
  {
    id: "status",
    title: "Status",
    sortable: true,
    align: "center",
    classes: "min-w-32",
  },
  { id: "department", title: "Department", classes: "min-w-48" },
  { id: "location", title: "Location", classes: "min-w-40" },
  { id: "phone", title: "Phone", classes: "min-w-36" },
];

const wideItems = sampleItems.map((item) => ({
  ...item,
  location: "New York",
}));

export const SlotsApiScrollable: StoryType = {
  args: {
    columns: wideColumns,
    items: wideItems,
    pages: 1,
    page: 1,
    bordered: true,
    scrollable: true,
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: `
      <div class="max-w-2xl">
        <VcTable v-bind="args">
          <template #desktop-body>
            <tr
              v-for="item in args.items"
              :key="item.id"
              class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
            >
              <td class="p-5 min-w-52">{{ item.name }}</td>
              <td class="p-5 min-w-64">{{ item.email }}</td>
              <td class="p-5 min-w-40">{{ item.role }}</td>
              <td class="p-5 min-w-32 text-center">{{ item.status }}</td>
              <td class="p-5 min-w-48">{{ item.department }}</td>
              <td class="p-5 min-w-40">{{ item.location }}</td>
              <td class="p-5 min-w-36">{{ item.phone }}</td>
            </tr>
          </template>
        </VcTable>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "**Slots API.** Horizontal scrolling with `VcScrollbar` when table is wider than container. Use `scrollable` prop to enable.",
      },
      source: {
        code: `
<script setup lang="ts">
const columns: VcTableColumnType[] = [
  { id: "name", title: "Name", classes: "min-w-52" },
  { id: "email", title: "Email", classes: "min-w-64" },
  { id: "department", title: "Department", classes: "min-w-48" },
  // ... more columns
];
</script>

<template>
  <VcTable
    :columns="columns"
    :items="items"
    bordered
    scrollable
  >
    <template #desktop-body>
      <tr v-for="item in items" :key="item.id">
        <td class="p-5 min-w-52">{{ item.name }}</td>
        <td class="p-5 min-w-64">{{ item.email }}</td>
        <td class="p-5 min-w-48">{{ item.department }}</td>
        <!-- ... -->
      </tr>
    </template>
  </VcTable>
</template>
        `,
      },
    },
  },
};

// 27. SlotsApiFull
export const SlotsApiFull: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 5,
    page: 1,
    sort: { column: "name", direction: "asc" },
    bordered: true,
  },
  render: (args) => ({
    components: { VcTable, VcBadge },
    setup: () => {
      const page = ref(args.page);
      const sort = ref<VcTableSortInfoType | undefined>(args.sort);
      const sortedItems = computed(() => sortItems(args.items ?? [], sort.value));

      const handlePageChange = (newPage: number) => {
        page.value = newPage;
      };

      const handleHeaderClick = (sortInfo: VcTableSortInfoType) => {
        sort.value = sortInfo;
      };

      return { args, page, sort, sortedItems, handlePageChange, handleHeaderClick };
    },
    template: `
      <VcTable
        v-bind="args"
        :items="sortedItems"
        :page="page"
        :sort="sort"
        @page-changed="handlePageChange"
        @header-click="handleHeaderClick"
      >
        <template #mobile-item="{ item }">
          <div class="border-b border-neutral-200 p-4 last:border-b-0">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold">{{ item.name }}</span>
              <VcBadge
                :color="item.status === 'Active' ? 'success' : 'neutral'"
                variant="solid-light"
                size="sm"
              >
                {{ item.status }}
              </VcBadge>
            </div>
            <div class="text-sm text-neutral-600">{{ item.email }}</div>
            <div class="text-sm text-neutral-500">{{ item.role }}</div>
          </div>
        </template>

        <template #desktop-body>
          <tr
            v-for="item in sortedItems"
            :key="item.id"
            class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
          >
            <td class="p-5">{{ item.name }}</td>
            <td class="p-5">{{ item.email }}</td>
            <td class="p-5">{{ item.role }}</td>
            <td class="p-5 text-center">
              <VcBadge
                :color="item.status === 'Active' ? 'success' : 'neutral'"
                variant="solid-light"
                size="sm"
              >
                {{ item.status }}
              </VcBadge>
            </td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "**Slots API.** Complete example with sorting, pagination, borders, and both mobile and desktop views.",
      },
      source: {
        code: `
<script setup lang="ts">
interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const columns: VcTableColumnType[] = [
  { id: "name", title: "Name", sortable: true },
  { id: "email", title: "Email", sortable: true },
  { id: "role", title: "Role" },
  { id: "status", title: "Status", sortable: true, align: "center" },
];

const items = ref<IUser[]>([]);
const page = ref(1);
const pages = ref(5);
const sort = ref<VcTableSortInfoType>({ column: "name", direction: "asc" });

async function onPageChange(newPage: number) {
  page.value = newPage;
  await fetchItems();
}

async function onHeaderClick(sortInfo: VcTableSortInfoType) {
  sort.value = sortInfo;
  await fetchItems();
}
</script>

<template>
  <VcTable
    :columns="columns"
    :items="items"
    :pages="pages"
    :page="page"
    :sort="sort"
    bordered
    @page-changed="onPageChange"
    @header-click="onHeaderClick"
  >
    <!-- Mobile view -->
    <template #mobile-item="{ item }">
      <div class="border-b p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="font-bold">{{ item.name }}</span>
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </div>
        <div class="text-sm text-neutral-600">{{ item.email }}</div>
        <div class="text-sm text-neutral-500">{{ item.role }}</div>
      </div>
    </template>

    <!-- Desktop view -->
    <template #desktop-body>
      <tr
        v-for="item in items"
        :key="item.id"
        class="even:bg-neutral-50 hover:bg-neutral-200"
      >
        <td class="p-5">{{ item.name }}</td>
        <td class="p-5">{{ item.email }}</td>
        <td class="p-5">{{ item.role }}</td>
        <td class="p-5 text-center">
          <VcBadge
            :color="item.status === 'Active' ? 'success' : 'neutral'"
            variant="solid-light"
            size="sm"
          >
            {{ item.status }}
          </VcBadge>
        </td>
      </tr>
    </template>
  </VcTable>
</template>
        `,
      },
    },
  },
};
