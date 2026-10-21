import { computed, ref } from "vue";
import { VcLoadMore, VcScrollbar } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLoadMore> = {
  title: "Components/Atoms/VcLoadMore",
  component: VcLoadMore,
  parameters: {
    docs: {
      description: {
        component:
          "Asks for the next page of a paged list, and shows that one is on its way. It has no " +
          "viewport of its own: it reads where the surrounding `VcScrollbar` is resting, and " +
          "requests a page whenever that is the bottom — including the bottom of a page too short " +
          "to scroll, which is the case a sentinel watching for a crossing can never report. " +
          "`item-count` tells it when a page has landed, so a list that still fits fills itself up " +
          "rather than stalling; `loading` shows the spinner and holds a second request back while one is on its way.",
      },
    },
  },
  argTypes: {
    hasNextPage: { control: "boolean", description: "Another page exists. Nothing is requested without it." },
    loading: {
      control: "boolean",
      description: "A page is on its way: shows the spinner and holds back further requests.",
    },
    itemCount: {
      control: "number",
      description:
        "How many items are loaded — the loaded items, not the rendered rows. A request counts as answered once " +
        "the count grows, and a count that drops is a list rebuilt for a new search. A failed page is not " +
        "repeated while the list rests unchanged at its end; scrolling away and back, a smaller count or a " +
        "rewrite of the rows it asked from retries it (rows added after them do not), and a list too short " +
        "to scroll is retried by the consumer.",
    },
    tag: { control: "text" },
  },
};

export default meta;

type StoryType = StoryObj<typeof meta>;

const PAGE_DELAY_MS = 600;
const TOTAL_PAGES = 4;

function usePagedList(firstPageSize: number, pageSize: number) {
  const items = ref(Array.from({ length: firstPageSize }, (_, index) => index + 1));
  const page = ref(1);
  const loading = ref(false);
  const requests = ref(0);

  async function loadMore() {
    requests.value++;
    loading.value = true;

    await new Promise((resolve) => setTimeout(resolve, PAGE_DELAY_MS));

    const start = items.value.length;
    items.value.push(...Array.from({ length: pageSize }, (_, index) => start + index + 1));
    page.value++;
    loading.value = false;
  }

  return { items, page, loading, requests, loadMore, hasNextPage: computed(() => page.value < TOTAL_PAGES) };
}

const STATUS_LINE = `
  <div class="text-sm text-neutral-600">
    {{ items.length }} items, page {{ page }}/${TOTAL_PAGES}, {{ requests }} request(s)
  </div>
`;

const listTemplate = (loadMoreMarkup: string) => `
  <div class="flex flex-col gap-4">
    ${STATUS_LINE}

    <VcScrollbar vertical :edge-threshold="50" class="h-64 rounded border border-neutral-200">
      <div class="space-y-2 p-2">
        <div v-for="item in items" :key="item" class="rounded bg-neutral-100 p-3">Item {{ item }}</div>
      </div>

      ${loadMoreMarkup}
    </VcScrollbar>
  </div>
`;

const DEFAULT_LOAD_MORE = `
  <VcLoadMore
    v-bind="args"
    :loading="loading"
    :has-next-page="hasNextPage"
    :item-count="items.length"
    @load-more="loadMore"
  />
`;

// The list drives these; the Controls table keeps their descriptions only.
const LIST_DRIVEN_ARG_TYPES = {
  loading: { control: false },
  hasNextPage: { control: false },
  itemCount: { control: false },
} as const;

const STATES = [
  { label: "A page is on its way", props: { loading: true, hasNextPage: true, itemCount: 0 } },
  { label: "More pages, nothing in flight", props: { loading: false, hasNextPage: true, itemCount: 0 } },
  { label: "No next page", props: { loading: false, hasNextPage: false, itemCount: 0 } },
];

export const Paging: StoryType = {
  argTypes: LIST_DRIVEN_ARG_TYPES,
  render: (args) => ({
    components: { VcLoadMore, VcScrollbar },
    setup: () => ({ args, ...usePagedList(15, 15) }),
    template: listTemplate(DEFAULT_LOAD_MORE),
  }),
  parameters: {
    docs: {
      description: {
        story: "The usual case: the first page overflows, and scrolling to the bottom asks for the next one.",
      },
      source: {
        code: `
<script setup lang="ts">
const { items, loading, hasNextPage, loadMore } = usePagedList();
</script>

<template>
  <VcScrollbar vertical :edge-threshold="50" class="h-64">
    <div v-for="item in items" :key="item">Item {{ item }}</div>

    <VcLoadMore :loading="loading" :has-next-page="hasNextPage" :item-count="items.length" @load-more="loadMore" />
  </VcScrollbar>
</template>
        `,
      },
    },
  },
};

export const Basic: StoryType = {
  args: { loading: true, hasNextPage: true, itemCount: 0 },
  render: (args) => ({
    components: { VcLoadMore, VcScrollbar },
    setup: () => ({ args }),
    template:
      '<VcScrollbar vertical class="rounded border border-dashed border-neutral-300"><VcLoadMore v-bind="args" /></VcScrollbar>',
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The component with no list around it, only the `VcScrollbar` it reads — every state is driven by the " +
          "controls, and the `load-more` it emits at rest has no listener here. " +
          "Unless a page is on its way it shows nothing — only an empty status region, kept mounted so the " +
          "loading text is announced: the empty dashed box is that state, and it is the one a paged list " +
          "spends most of its life in.",
      },
      source: {
        code: `
<!-- No list: the props draw the state, and nobody listens to load-more. -->
<VcScrollbar vertical>
  <VcLoadMore :loading="loading" :has-next-page="hasNextPage" :item-count="items.length" />
</VcScrollbar>
        `,
      },
    },
  },
};

export const States: StoryType = {
  render: (args) => ({
    components: { VcLoadMore, VcScrollbar },
    setup: () => ({ args, states: STATES }),
    template: `
      <div class="flex flex-col gap-3">
        <div v-for="state in states" :key="state.label" class="flex items-center gap-4">
          <div class="w-64 shrink-0 text-sm text-neutral-600">{{ state.label }}</div>

          <VcScrollbar vertical class="grow rounded border border-dashed border-neutral-300">
            <VcLoadMore v-bind="state.props" />
          </VcScrollbar>
        </div>
      </div>
    `,
  }),
  parameters: {
    // Every state is drawn from its own props, not from the controls.
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Every state the bottom of a paged list can be in. Only a page on its way is drawn; the rest " +
          "leave an empty status region, kept mounted so the loading text is announced.",
      },
      source: {
        code: `
<VcLoadMore loading has-next-page :item-count="items.length" />          <!-- a page is on its way -->
<VcLoadMore :loading="false" has-next-page :item-count="items.length" /> <!-- more pages, nothing in flight: an empty status region -->
<VcLoadMore :item-count="items.length" />                                <!-- no next page: an empty status region -->
        `,
      },
    },
  },
};

export const ShortFirstPage: StoryType = {
  argTypes: LIST_DRIVEN_ARG_TYPES,
  render: (args) => ({
    components: { VcLoadMore, VcScrollbar },
    setup: () => ({ args, ...usePagedList(2, 3) }),
    template: listTemplate(DEFAULT_LOAD_MORE),
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Two rows, and nothing to scroll — the list is at its bottom the moment it renders, so it " +
          "asks for page 2 unprompted, and keeps asking until the rows overflow the viewport or the " +
          "pages run out. Watch the request counter: one per page, never more — each request waits " +
          "for the item count to grow.",
      },
      source: {
        code: `
<!-- Same markup as Paging; only the data differs — a first page of two rows and three per page. -->
<VcScrollbar vertical :edge-threshold="50" class="h-64">
  <div v-for="item in items" :key="item">Item {{ item }}</div>

  <VcLoadMore :loading="loading" :has-next-page="hasNextPage" :item-count="items.length" @load-more="loadMore" />
</VcScrollbar>
        `,
      },
    },
  },
};

export const CustomIndicator: StoryType = {
  argTypes: LIST_DRIVEN_ARG_TYPES,
  render: (args) => ({
    components: { VcLoadMore, VcScrollbar },
    setup: () => ({ args, ...usePagedList(15, 15) }),
    template: listTemplate(`
      <VcLoadMore
        v-bind="args"
        :loading="loading"
        :has-next-page="hasNextPage"
        :item-count="items.length"
        @load-more="loadMore"
      >
        <template #loading>
          <span class="text-sm text-neutral-600">Loading page {{ page + 1 }}…</span>
        </template>
      </VcLoadMore>
    `),
  }),
  parameters: {
    docs: {
      description: {
        story: "`#loading` replaces the spinner and leaves the request behaviour untouched.",
      },
      source: {
        code: `
<VcScrollbar vertical :edge-threshold="50" class="h-64">
  <div v-for="item in items" :key="item">Item {{ item }}</div>

  <VcLoadMore :loading="loading" :has-next-page="hasNextPage" :item-count="items.length" @load-more="loadMore">
    <template #loading>
      <span class="text-sm text-neutral-600">Loading page {{ page + 1 }}…</span>
    </template>
  </VcLoadMore>
</VcScrollbar>
        `,
      },
    },
  },
};

export const InsideAList: StoryType = {
  argTypes: { ...LIST_DRIVEN_ARG_TYPES, tag: { control: false }, role: { control: false } },
  render: (args) => ({
    components: { VcLoadMore, VcScrollbar },
    setup: () => ({ args, ...usePagedList(15, 15) }),
    template: `
      <div class="flex flex-col gap-4">
        ${STATUS_LINE}

        <VcScrollbar vertical tag="ul" :edge-threshold="50" class="h-64 rounded border border-neutral-200">
          <li v-for="item in items" :key="item" class="border-b border-neutral-200 p-3">Item {{ item }}</li>

          <VcLoadMore
            v-bind="args"
            tag="li"
            role="none"
            :loading="loading"
            :has-next-page="hasNextPage"
            :item-count="items.length"
            @load-more="loadMore"
          />
        </VcScrollbar>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`tag` keeps the markup valid inside a list: a `<div>` is not allowed as a child of `<ul>`, " +
          'and `role="none"` replaces the default `role="status"`, which would otherwise be read as ' +
          "a live region announcing every page; in any role but `status` the item is in the list only while a " +
          'next page loads. A `role="listbox"` is different again — it may own ' +
          "options and nothing else, so put the list inside the scroll region and the pager after it.",
      },
      source: {
        code: `
<VcScrollbar vertical tag="ul" :edge-threshold="50" class="h-64">
  <li v-for="item in items" :key="item" class="border-b border-neutral-200 p-3">Item {{ item }}</li>

  <VcLoadMore
    tag="li"
    role="none"
    :loading="loading"
    :has-next-page="hasNextPage"
    :item-count="items.length"
    @load-more="loadMore"
  />
</VcScrollbar>
        `,
      },
    },
  },
};
