import { VcPushMessage } from "..";
import { unreadPushMessageMock, readPushMessageMock } from "../../../mocks/notification.mock";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcPushMessage",
  component: VcPushMessage,
  argTypes: { onClick: { action: "click" }, onRemove: { action: "remove" } },
} as Meta<typeof VcPushMessage>;

const Template: StoryFn<typeof VcPushMessage> = (args) => ({
  components: { VcPushMessage },
  setup: () => ({ args }),
  template: '<VcPushMessage v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  notification: unreadPushMessageMock,
};

export const Removable = Template.bind({});
Removable.args = {
  notification: unreadPushMessageMock,
  removable: true,
};

export const Read = Template.bind({});
Read.args = {
  notification: readPushMessageMock,
  removable: true,
};
