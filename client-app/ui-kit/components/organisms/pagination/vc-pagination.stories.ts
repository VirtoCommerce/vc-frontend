import { VcPagination } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcPagination",
  component: VcPagination,
} as Meta<typeof VcPagination>;

const Template: StoryFn<typeof VcPagination> = (args) => ({
  components: { VcPagination },
  setup: () => ({ args }),
  template: '<VcPagination v-bind="args" />',
});

export const Page1 = Template.bind({});
Page1.args = {
  page: 1,
  pages: 147,
};

export const Page5 = Template.bind({});
Page5.args = {
  page: 5,
  pages: 147,
};

export const Page6 = Template.bind({});
Page6.args = {
  page: 6,
  pages: 147,
};

export const Page55 = Template.bind({});
Page55.args = {
  page: 55,
  pages: 147,
};

export const Page142 = Template.bind({});
Page142.args = {
  page: 142,
  pages: 147,
};

export const Page143 = Template.bind({});
Page143.args = {
  page: 143,
  pages: 147,
};

export const Page147 = Template.bind({});
Page147.args = {
  page: 147,
  pages: 147,
};

export const FewPages = Template.bind({});
FewPages.args = {
  page: 1,
  pages: 9,
};

export const OnePage = Template.bind({});
OnePage.args = {
  page: 1,
  pages: 1,
};

export const ThreePages = Template.bind({});
ThreePages.args = {
  page: 2,
  pages: 3,
};

export const Compact = Template.bind({});
Compact.args = {
  page: 1,
  pages: 9,
  compact: true,
};
