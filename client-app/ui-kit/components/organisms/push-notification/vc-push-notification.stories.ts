import { VcPushNotification } from "..";
import { notificationMock1, notificationMock2 } from "../../../mocks/notification.mock";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcPushNotification",
  component: VcPushNotification,
  argTypes: { onClick: { action: "click" }, onRemove: { action: "remove" } },
} as Meta<typeof VcPushNotification>;

const Template: StoryFn<typeof VcPushNotification> = (args) => ({
  components: { VcPushNotification },
  setup: () => ({ args }),
  template: '<VcPushNotification v-bind="args" />',
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
