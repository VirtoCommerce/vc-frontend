import { VcInfinityScrollLoader } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const MIGRATION_GUIDE = `
Deprecated — use **VcLoadMore** inside a **VcScrollbar** instead.

This component watches a sentinel element with its own \`IntersectionObserver\`, which reports
*crossings*: it fires once when the sentinel first becomes visible and then stays silent for as
long as it remains visible. A list whose pages do not fill its viewport therefore loads exactly
one more page and stops — the sentinel never left the screen, so it can never come back onto it.
It also takes \`pageNumber\`/\`pagesCount\` only to derive the one fact it acts on — whether
another page exists — which every consumer paging by cursor then has to fake.

\`VcLoadMore\` asks the scrollbar it sits in where the list is resting, and takes that one fact
directly:

Before:

\`\`\`vue
<VcInfinityScrollLoader
  v-if="hasNextPage"
  :loading="loading"
  :page-number="currentPage"
  :pages-count="pagesCount"
  distance="50"
  @visible="loadMore"
/>
\`\`\`

After:

\`\`\`vue
<VcScrollbar vertical :edge-threshold="50">
  <!-- options -->
  <VcLoadMore :loading="loading" :has-next-page="hasNextPage" @load-more="loadMore" />
</VcScrollbar>
\`\`\`

Notes:

- \`distance\` becomes \`edge-threshold\` on the scrollbar — it is the scroll region's own measure,
  not the loader's.
- \`loading\` is now required for correctness, not just for the spinner: it is what stops one
  request becoming many, and what asks for the page after next when a list still fits.
- The end-of-list row is still here, unchanged in looks, but it is opt-in: \`show-end-of-list\`
  replaces \`page-number >= pages-count\`, and \`is-page-limit-reached\` becomes
  \`page-limit-reached\`. Three of the four consumers suppressed the row with
  \`v-if="hasNextPage"\`, so "off unless asked" is what they were already doing.
- A consumer that scrolls the document rather than a \`VcScrollbar\` cannot use \`VcLoadMore\` yet.
`;

const meta: Meta<typeof VcInfinityScrollLoader> = {
  title: "Components/Atoms/VcInfinityScrollLoader",
  component: VcInfinityScrollLoader,
  tags: ["deprecated"],
  parameters: {
    deprecated: MIGRATION_GUIDE,
    docs: {
      description: {
        component: MIGRATION_GUIDE,
      },
    },
  },
  argTypes: {
    loading: {
      control: "boolean",
      description: "Show loading state",
    },
    pagesCount: {
      control: "number",
      description: "Total number of pages",
    },
    pageNumber: {
      control: "number",
      description: "Current page number",
    },
    isPageLimitReached: {
      control: "boolean",
      description: "Whether page limit is reached",
    },
    distance: {
      control: "number",
      description: "Distance from viewport to trigger loading",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcInfinityScrollLoader v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Loading: StoryType = {
  args: {
    loading: true,
    pagesCount: 10,
    pageNumber: 1,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcInfinityScrollLoader :loading="true" :pages-count="10" :page-number="1" />
        `,
      },
    },
  },
};

export const EndOfList: StoryType = {
  args: {
    loading: false,
    pagesCount: 5,
    pageNumber: 5,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcInfinityScrollLoader :loading="false" :pages-count="5" :page-number="5" />
        `,
      },
    },
  },
};
