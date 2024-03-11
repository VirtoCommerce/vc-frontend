import { VcPushMessages } from "..";
import { unreadPushMessageMock, readPushMessageMock } from "../../../mocks/notification.mock";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcPushMessages",
  component: VcPushMessages,
  argTypes: {
    onReadAll: { action: "readAll" },
    onUnreadAll: { action: "unreadAll" },
    onItemClick: { action: "itemClick" },
    onItemRemove: { action: "itemRemove" },
    onClearRecent: { action: "clearRecent" },
  },
} as Meta<typeof VcPushMessages>;

const Template: StoryFn<typeof VcPushMessages> = (args) => ({
  components: { VcPushMessages },
  setup: () => ({ args }),
  template: `<VcPushMessages class="inline-block" v-bind="args">
    <span class="p-1.5 rounded bg-neutral-600 text-neutral-100">Click me!!!</span>
  </VcPushMessages>`,
});

export const Basic = Template.bind({});

export const Notifications = Template.bind({});
Notifications.args = {
  items: [unreadPushMessageMock, unreadPushMessageMock, readPushMessageMock, readPushMessageMock, readPushMessageMock],
};

export const Removable = Template.bind({});
Removable.args = {
  items: [unreadPushMessageMock, unreadPushMessageMock, readPushMessageMock, readPushMessageMock, readPushMessageMock],
  removable: true,
};

export const Options = Template.bind({});
Options.args = {
  items: [
    unreadPushMessageMock,
    unreadPushMessageMock,
    unreadPushMessageMock,
    readPushMessageMock,
    readPushMessageMock,
  ],
  removable: true,
  options: true,
};
