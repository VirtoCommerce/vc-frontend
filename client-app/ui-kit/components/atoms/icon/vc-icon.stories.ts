import { VcIcon } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcIcon",
  component: VcIcon,
} as Meta<typeof VcIcon>;

const Template: StoryFn<typeof VcIcon> = (args) => ({
  components: { VcIcon },
  setup: () => ({ args }),
  template: '<VcIcon v-bind="args" />',
});

const iconList = import.meta.glob("@/assets/icons/basic/*.svg", { eager: true });

const TemplateList: StoryFn<typeof VcIcon> = (args) => ({
  components: { VcIcon },
  setup() {
    const icons = Object.keys(iconList).map((path) => path.split("/").pop()?.replace(".svg", ""));

    return { args, icons };
  },
  template: `
    <div class="flex flex-wrap gap-3">
      <div v-for="icon in icons" :key="icon" class="border rounded p-2 text-center">
        <VcIcon :name="icon" v-bind="args" />
        <div>{{ icon }}</div>
      </div>
    </div>
  `,
});

export const Basic = Template.bind({});

export const Color = Template.bind({});
Color.args = {
  class: "fill-danger",
};

export const Size = Template.bind({});
Size.args = {
  size: 50,
};

export const AllIcons = TemplateList.bind({});
AllIcons.args = {
  size: "md",
  class: "text-secondary-600",
};
