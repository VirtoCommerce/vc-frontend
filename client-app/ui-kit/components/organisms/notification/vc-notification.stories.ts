import { VcNotification } from "..";
import { notificationMock1, notificationMock2 } from "../../../mocks/notification.mock";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcNotification",
  component: VcNotification,
  argTypes: { onClick: { action: "click" }, onRemove: { action: "remove" } },
} as Meta<typeof VcNotification>;

const Template: StoryFn<typeof VcNotification> = (args) => ({
  components: { VcNotification },
  setup: () => ({ args }),
  template: '<VcNotification v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  notification: notificationMock1,
};

export const Removable = Template.bind({});
Removable.args = {
  notification: notificationMock1,
  removable: true,
};

export const Read = Template.bind({});
Read.args = {
  notification: notificationMock2,
  removable: true,
};
