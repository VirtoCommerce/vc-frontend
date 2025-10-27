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
