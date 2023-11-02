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

export const Basic = Template.bind({});
Basic.args = {
  page: 11,
  pages: 147,
};
