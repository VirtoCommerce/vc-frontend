import { VcCollapsibleContent } from "..";
import { VcMarkdownRender } from "../../atoms";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcCollapsibleContent",
  component: VcCollapsibleContent,
  argTypes: {
    maxHeight: { control: "text" },
    collapse: { control: "boolean" },
  },
  args: {
    maxHeight: "12rem",
    collapse: false,
  },
} as Meta<typeof VcCollapsibleContent>;

const Template: StoryFn<typeof VcCollapsibleContent> = (args) => ({
  components: { VcCollapsibleContent, VcMarkdownRender },
  setup: () => ({ args }),
  template: `
    <VcCollapsibleContent v-bind="args">
      <VcMarkdownRender src='<table><tbody><tr><th colspan="2">System</th></tr><tr><td>Channels</td><td>5.1</td></tr><tr><td>Power</td><td>Total: 1000 W</td></tr><tr><td>DSP Modes</td><td>8</td></tr></tbody></table><table><tbody><tr><th colspan="2">Disc Player</th></tr><tr><td>Disc Loading</td><td>Tray</td></tr><tr><td>Disc Capacity</td><td>1</td></tr><tr><td>Disc Types</td><td>Blu-ray, 3D Blu-ray, DVD, DVD+R, DVD-R, DVD+RW, DVD-RW</td></tr><tr><td>Region</td><td>DVD: 1<br/>Blu-ray: A</td></tr><tr><td>BD Profile</td><td>5.0</td></tr><tr><td>BD Live</td><td>Yes</td></tr><tr><td>DVD Upscaling</td><td>Yes</td></tr><tr><td>Streaming Capability</td><td>Yes</td></tr></tbody></table>' />
    </VcCollapsibleContent>
  `,
});

export const Basic = Template.bind({});

export const Toggled: StoryFn<typeof VcCollapsibleContent> = (args) => ({
  components: { VcCollapsibleContent },
  setup: () => ({ args }),
  template: `
    <VcCollapsibleContent v-bind="args" style="max-width:640px">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
    dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
    dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
    dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </VcCollapsibleContent>
  `,
});

Toggled.args = {
  collapse: true,
};
