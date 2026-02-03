import { ref } from "vue";
import { VcTable } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcTable> = {
  title: "Components/Organisms/VcTable",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: VcTable as any,
  argTypes: {
    skeletonRows: {
      control: { type: "number", min: 1, max: 20 },
      type: { name: "number", required: false },
    },
  },
  render: (args) => ({
    components: { VcTable },
    setup: () => ({ args }),
    template: '<VcTable v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

// Sample data
const sampleItems = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User", status: "Inactive" },
  { id: 4, name: "Alice Williams", email: "alice@example.com", role: "Moderator", status: "Active" },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com", role: "User", status: "Active" },
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
        <template #header>
          <thead class="vc-table__head">
            <tr class="vc-table__row">
              <th class="vc-table__cell vc-table__cell--head">Custom Header</th>
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
};
