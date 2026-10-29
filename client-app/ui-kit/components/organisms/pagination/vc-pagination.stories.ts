import { VcPagination } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcPagination> = {
  title: "Components/Organisms/VcPagination",
  component: VcPagination,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcPagination v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Page1: StoryType = {
  args: {
    page: 1,
    pages: 147,
  },
};

export const Page5: StoryType = {
  args: {
    page: 5,
    pages: 147,
  },
};

export const Page6: StoryType = {
  args: {
    page: 6,
    pages: 147,
  },
};

export const Page55: StoryType = {
  args: {
    page: 55,
    pages: 147,
  },
};

export const Page142: StoryType = {
  args: {
    page: 142,
    pages: 147,
  },
};

export const Page143: StoryType = {
  args: {
    page: 143,
    pages: 147,
  },
};

export const Page147: StoryType = {
  args: {
    page: 147,
    pages: 147,
  },
};

export const FewPages: StoryType = {
  args: {
    page: 1,
    pages: 9,
  },
};

export const OnePage: StoryType = {
  args: {
    page: 1,
    pages: 1,
  },
};

export const ThreePages: StoryType = {
  args: {
    page: 2,
    pages: 3,
  },
};

export const Compact: StoryType = {
  args: {
    page: 1,
    pages: 9,
    compact: true,
  },
};

// The design is one attribute on <html>, so the Docs page, which renders every story at once, cannot show soft.
export const SoftDesign: StoryType = {
  args: {
    page: 6,
    pages: 147,
  },
  globals: { design: "soft" },
  tags: ["!autodocs"],
};

export const SoftDesignCompact: StoryType = {
  args: {
    page: 2,
    pages: 9,
    compact: true,
  },
  globals: { design: "soft" },
  tags: ["!autodocs"],
};

export const SoftDesignWrapped: StoryType = {
  args: {
    page: 6,
    pages: 147,
  },
  globals: { design: "soft" },
  tags: ["!autodocs"],
  decorators: [() => ({ template: '<div class="max-w-80"><story /></div>' })],
};

export const ActivePageCSSVariables: StoryType = {
  args: {
    page: 2,
    pages: 9,
    class: "[--vc-pagination-page-active-bg:#0055CC] [--vc-pagination-page-active-text:#FFFFFF]",
  },
};
