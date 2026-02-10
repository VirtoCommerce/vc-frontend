import { ref } from "vue";
import { VcBadge } from "@/ui-kit/components/atoms";
import { BREAKPOINTS } from "@/ui-kit/constants";
import { VcTable } from "..";
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
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "Active",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Alice Williams",
    email: "alice@example.com",
    role: "Moderator",
    status: "Active",
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "User",
    status: "Active",
  },
];

const sampleColumns: VcTableColumnType[] = [
  { id: "name", title: "Name", sortable: true },
  { id: "email", title: "Email", sortable: true },
  { id: "role", title: "Role" },
  { id: "status", title: "Status", sortable: true, align: "center" },
];

export const Basic: StoryType = {
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

export const BasicMobile: StoryType = {
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
          "Mobile view with `mobile-item` slot. Table switches to mobile view when screen width is less than the `mobileBreakpoint`.",
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

const items = ref<IUser[]>([...]);
</script>

<template>
  <VcTable
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

export const WithSorting: StoryType = {
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
      const handleHeaderClick = (sortInfo: VcTableSortInfoType) => {
        sort.value = sortInfo;
      };
      return { args, sort, handleHeaderClick };
    },
    template: `
      <VcTable
        v-bind="args"
        :sort="sort"
        @header-click="handleHeaderClick"
      >
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
      source: {
        code: `
<script setup lang="ts">
const sort = ref<VcTableSortInfoType>({ column: "name", direction: "asc" });

function onHeaderClick(sortInfo: VcTableSortInfoType) {
  sort.value = sortInfo;
  // Fetch sorted data...
}
</script>

<template>
  <VcTable
    :columns="columns"
    :items="items"
    :sort="sort"
    @header-click="onHeaderClick"
  >
    <template #desktop-body>
      <tr v-for="item in items" :key="item.id">
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

export const Loading: StoryType = {
  args: {
    columns: sampleColumns,
    items: [],
    pages: 1,
    page: 1,
    loading: true,
    skeletonRows: 5,
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcTable
  :columns="columns"
  :items="[]"
  :loading="true"
  :skeleton-rows="5"
/>
        `,
      },
    },
  },
};

export const LoadingMobile: StoryType = {
  args: {
    columns: sampleColumns,
    items: [],
    pages: 1,
    page: 1,
    loading: true,
    skeletonRows: 5,
    mobileBreakpoint: "md",
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <template #mobile-item="{ item }">
          <div class="p-4">{{ item.name }}</div>
        </template>

        <template #desktop-body>
          <tr v-for="item in args.items" :key="item.id" class="even:bg-neutral-50">
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
          "Default mobile skeleton view when loading. The skeleton is automatically displayed when `loading` is true.",
      },
      source: {
        code: `
<VcTable
  :columns="columns"
  :items="[]"
  :loading="true"
  :skeleton-rows="5"
  mobile-breakpoint="md"
>
  <template #mobile-item="{ item }">
    <div class="p-4">{{ item.name }}</div>
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

export const Empty: StoryType = {
  args: {
    columns: sampleColumns,
    items: [],
    pages: 0,
    page: 0,
    description: "No items found",
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <template #desktop-empty>
          <tr>
            <td colspan="4" class="p-10 text-center text-neutral-500">
              No items available
            </td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<VcTable :columns="columns" :items="[]">
  <template #desktop-empty>
    <tr>
      <td :colspan="columns.length" class="p-10 text-center text-neutral-400">
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

export const EmptyMobile: StoryType = {
  args: {
    columns: sampleColumns,
    items: [],
    pages: 0,
    page: 0,
    mobileBreakpoint: "md",
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <template #mobile-item="{ item }">
          <div class="p-4">{{ item.name }}</div>
        </template>

        <template #mobile-empty>
          <div class="p-10 text-center text-neutral-400">
            <p>No items available</p>
          </div>
        </template>

        <template #desktop-empty>
          <tr>
            <td colspan="4" class="p-10 text-center text-neutral-400">
              <p>No items available</p>
            </td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Empty state for both mobile (`mobile-empty` slot) and desktop (`desktop-empty` slot) views.",
      },
      source: {
        code: `
<VcTable :columns="columns" :items="[]" mobile-breakpoint="md">
  <template #mobile-item="{ item }">
    <!-- Required to enable mobile view -->
    <div class="p-4">{{ item.name }}</div>
  </template>

  <template #mobile-empty>
    <div class="p-10 text-center text-neutral-400">
      <svg class="mx-auto h-12 w-12 text-neutral-300 mb-4" ...>...</svg>
      <p>No items available</p>
    </div>
  </template>

  <template #desktop-empty>
    <tr>
      <td :colspan="columns.length" class="p-10 text-center text-neutral-400">
        <svg class="mx-auto h-12 w-12 text-neutral-300 mb-4" ...>...</svg>
        <p>No items available</p>
      </td>
    </tr>
  </template>
</VcTable>
        `,
      },
    },
  },
};

export const WithPagination: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 5,
    page: 1,
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => {
      const page = ref(args.page);
      const handlePageChange = (newPage: number) => {
        page.value = newPage;
      };
      return { args, page, handlePageChange };
    },
    template: `
      <VcTable
        v-bind="args"
        :page="page"
        @page-changed="handlePageChange"
      >
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
  <VcTable
    :columns="columns"
    :items="items"
    :pages="pages"
    :page="page"
    @page-changed="onPageChange"
  >
    <template #desktop-body>
      <!-- ... -->
    </template>
  </VcTable>
</template>
        `,
      },
    },
  },
};

export const WithPaginationMobile: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 5,
    page: 1,
    mobileBreakpoint: "md",
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => {
      const page = ref(args.page);
      const handlePageChange = (newPage: number) => {
        page.value = newPage;
      };
      return { args, page, handlePageChange };
    },
    template: `
      <VcTable
        v-bind="args"
        :page="page"
        @page-changed="handlePageChange"
      >
        <template #mobile-item="{ item }">
          <div class="border-b border-neutral-200 p-4 last:border-b-0">
            <div class="font-bold">{{ item.name }}</div>
            <div class="text-sm text-neutral-600">{{ item.email }}</div>
          </div>
        </template>

        <template #desktop-body>
          <tr
            v-for="item in args.items"
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
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Pagination works the same way in mobile view.",
      },
      source: {
        code: `
<script setup lang="ts">
const page = ref(1);

function onPageChange(newPage: number) {
  page.value = newPage;
}
</script>

<template>
  <VcTable
    :columns="columns"
    :items="items"
    :pages="5"
    :page="page"
    mobile-breakpoint="md"
    @page-changed="onPageChange"
  >
    <template #mobile-item="{ item }">
      <div class="border-b border-neutral-200 p-4 last:border-b-0">
        <div class="font-bold">{{ item.name }}</div>
        <div class="text-sm text-neutral-600">{{ item.email }}</div>
      </div>
    </template>

    <template #desktop-body>
      <tr v-for="item in items" :key="item.id" class="even:bg-neutral-50 hover:bg-neutral-200">
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

export const CustomSkeleton: StoryType = {
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

export const CustomSkeletonMobile: StoryType = {
  args: {
    columns: sampleColumns,
    items: [],
    pages: 1,
    page: 1,
    loading: true,
    skeletonRows: 3,
    mobileBreakpoint: "md",
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: `
      <VcTable v-bind="args">
        <template #mobile-item="{ item }">
          <div class="p-4">{{ item.name }}</div>
        </template>

        <template #mobile-skeleton>
          <div
            v-for="i in args.skeletonRows"
            :key="i"
            class="border-b border-neutral-200 p-4 space-y-2"
          >
            <div class="h-5 w-1/3 animate-pulse bg-primary-200 rounded" />
            <div class="h-4 w-2/3 animate-pulse bg-neutral-200 rounded" />
            <div class="h-4 w-1/2 animate-pulse bg-neutral-200 rounded" />
          </div>
        </template>

        <template #desktop-body>
          <tr v-for="item in args.items" :key="item.id" class="even:bg-neutral-50">
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
        story: "Custom mobile skeleton using `mobile-skeleton` slot.",
      },
      source: {
        code: `
<VcTable
  :columns="columns"
  :items="items"
  :loading="true"
  :skeleton-rows="3"
  mobile-breakpoint="md"
>
  <template #mobile-item="{ item }">
    <div class="p-4">{{ item.name }}</div>
  </template>

  <template #mobile-skeleton>
    <div
      v-for="i in 3"
      :key="i"
      class="border-b border-neutral-200 p-4 space-y-2"
    >
      <div class="h-5 w-1/3 animate-pulse bg-primary-200 rounded" />
      <div class="h-4 w-2/3 animate-pulse bg-neutral-200 rounded" />
      <div class="h-4 w-1/2 animate-pulse bg-neutral-200 rounded" />
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
        `,
      },
    },
  },
};

export const WithAlignment: StoryType = {
  args: {
    columns: [
      { id: "name", title: "Name (Left)", sortable: true, align: "left" },
      { id: "email", title: "Email (Center)", align: "center" },
      { id: "role", title: "Role (Right)", align: "right" },
    ],
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
            <td class="p-5 text-left">{{ item.name }}</td>
            <td class="p-5 text-center">{{ item.email }}</td>
            <td class="p-5 text-right">{{ item.role }}</td>
          </tr>
        </template>
      </VcTable>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<script setup lang="ts">
const columns: VcTableColumnType[] = [
  { id: "name", title: "Name", align: "left" },
  { id: "email", title: "Email", align: "center" },
  { id: "role", title: "Role", align: "right" },
];
</script>

<template>
  <VcTable :columns="columns" :items="items">
    <template #desktop-body>
      <tr v-for="item in items" :key="item.id">
        <td class="p-5 text-left">{{ item.name }}</td>
        <td class="p-5 text-center">{{ item.email }}</td>
        <td class="p-5 text-right">{{ item.role }}</td>
      </tr>
    </template>
  </VcTable>
</template>
        `,
      },
    },
  },
};

export const WithoutHeader: StoryType = {
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
        story: "Table without header using `hide-default-header` prop.",
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

export const CustomHeader: StoryType = {
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
        story: "Table with custom header using `#header` slot. The slot completely replaces the default header.",
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

export const Bordered: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 1,
    page: 1,
    bordered: true,
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
        story: "Table with border using `bordered` prop.",
      },
      source: {
        code: `<VcTable :columns="columns" :items="items" bordered>...</VcTable>`,
      },
    },
  },
};

export const MobileBordered: StoryType = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    pages: 1,
    page: 1,
    mobileBordered: true,
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
        story: "Table with border only on mobile using `mobile-bordered` prop (desktop has no border).",
      },
      source: {
        code: `<VcTable
  :columns="columns"
  :items="items"
  mobile-bordered
  mobile-breakpoint="md"
>
  <template #mobile-item="{ item }">
    <div class="p-4">{{ item.name }}</div>
  </template>

  <template #desktop-body>
    <tr v-for="item in items" :key="item.id">
      <td class="p-5">{{ item.name }}</td>
    </tr>
  </template>
</VcTable>`,
      },
    },
  },
};

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
  department: "Engineering",
  location: "New York",
  phone: "+1 234 567 890",
}));

export const WithScrollbar: StoryType = {
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
          "Horizontal scrolling with `VcScrollbar` when table is wider than container. Use `scrollable` prop to enable.",
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

export const SlotItemScoped: StoryType = {
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
          "Using `#mobile-item` and `#desktop-item` scoped slots. The component iterates over items internally and passes each item to the slot.",
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

export const FullExample: StoryType = {
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

      const handlePageChange = (newPage: number) => {
        page.value = newPage;
      };

      const handleHeaderClick = (sortInfo: VcTableSortInfoType) => {
        sort.value = sortInfo;
      };

      return { args, page, sort, handlePageChange, handleHeaderClick };
    },
    template: `
      <VcTable
        v-bind="args"
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
            v-for="item in args.items"
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
        story: "Complete example with sorting, pagination, borders, and both mobile and desktop views.",
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
