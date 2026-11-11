import { VcFrame } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

// Each header piece reads the frame's side inset itself: the slot has no wrapper.
const INSET = "ms-[var(--vc-frame-header-offset-x,0px)] me-[var(--vc-frame-header-offset-x,0px)]";

const HEADER = `<div class="sticky top-0 z-10 ${INSET} bg-additional-50 p-4 shadow-md">Header: one sticky piece</div>`;

const SPLIT_HEADER = `<div class="${INSET} bg-secondary-900 px-4 py-2 text-additional-50">Top row: scrolls away</div>

    <div class="sticky top-0 z-10 ${INSET} bg-additional-50 p-4 shadow-md">Main row: sticks</div>`;

const CONTENT = `<VcContainer>
    <div class="h-[60rem] rounded bg-neutral-100 p-4">Page content</div>
  </VcContainer>`;

const FOOTER = `<div class="bg-secondary-900 p-6 text-additional-50">Footer</div>`;

const frame = (header: string) => `<VcFrame>
  <template #header>
    ${header}
  </template>

  ${CONTENT}

  <template #footer>
    ${FOOTER}
  </template>
</VcFrame>`;

const meta: Meta<typeof VcFrame> = {
  title: "Components/Templates/VcFrame",
  component: VcFrame,
  parameters: {
    layout: "fullscreen",
    docs: {
      // Each story in its own iframe: the docs page holds no duplicate main landmark.
      story: { inline: false, height: "40rem" },
      description: {
        component: [
          "The header slot has no wrapper: put each header piece in it as a direct child, so a sticky piece sticks for",
          "the whole page; one block element around the pieces kills sticky. VcFrame is the page frame of a layout,",
          'one per page: the header, `<main id="main-content">` with the page, and the footer. Not VcLayout: that is a',
          "page's sidebar grid and goes inside the frame's main. The `--vc-frame-*`",
          "tokens set the side space, column and the spaces around header, page and footer: a design sets them on",
          '`html[data-design="<design>"]`, a fork on `:root` in `_custom.scss` (client-app/assets/styles/README.md,',
          "Page frame). Put the app's skip links first in the header",
          "slot: they target `#main-content` (the frame's main) and `#footer` (VcFooter renders it). A sticky header",
          "publishes its height as `--vc-app-header-height`, as both app layouts do, so the jump stops below it. The",
          "side space and column reach the page through VcContainer; each header piece reads",
          "`--vc-frame-header-offset-x` itself, the frame places the footer.",
        ].join(" "),
      },
    },
  },
  render: () => ({
    template: frame(HEADER),
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  parameters: {
    docs: { source: { code: frame(HEADER) } },
  },
};

export const CustomHeader: StoryType = {
  render: () => ({
    template: frame(SPLIT_HEADER),
  }),
  parameters: {
    docs: {
      description: {
        story:
          "A header in two pieces, both direct children of the frame: the top row scrolls away, the main row sticks.",
      },
      source: { code: frame(SPLIT_HEADER) },
    },
  },
};
