import { VcNotifications } from "..";
import { notificationMock1, notificationMock2 } from "../../../mocks/notification.mock";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcNotifications",
  component: VcNotifications,
  argTypes: {
    onReadAll: { action: "readAll" },
    onUnreadAll: { action: "unreadAll" },
    onItemClick: { action: "itemClick" },
    onItemRemove: { action: "itemRemove" },
    onClearRecent: { action: "clearRecent" },
  },
} as Meta<typeof VcNotifications>;

const Template: StoryFn<typeof VcNotifications> = (args) => ({
  components: { VcNotifications },
  setup: () => ({ args }),
  template: `<VcNotifications class="inline-block" v-bind="args">
    <span class="p-1.5 rounded bg-neutral-600 text-neutral-100">Click me!!!</span>
  </VcNotifications>`,
});

export const Basic = Template.bind({});

export const Notifications = Template.bind({});
Notifications.args = {
  items: [notificationMock1, notificationMock1, notificationMock2, notificationMock2, notificationMock2],
};

export const Removable = Template.bind({});
Removable.args = {
  items: [notificationMock1, notificationMock1, notificationMock2, notificationMock2, notificationMock2],
  removable: true,
};

export const Options = Template.bind({});
Options.args = {
  items: [notificationMock1, notificationMock1, notificationMock1, notificationMock2, notificationMock2],
  removable: true,
  options: true,
};
