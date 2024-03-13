import { VcPushMessages, VcPushMessage } from "..";
import { unreadPushMessageMock, readPushMessageMock } from "../../../mocks/notification.mock";
import type { Meta, StoryFn } from "@storybook/vue3";
import type { ComponentProps } from "vue-component-type-helpers";

type VcPushMessagesPropsAndCustomArgs = ComponentProps<typeof VcPushMessages> & { items: VcPushMessageType[] };

const meta: Meta<VcPushMessagesPropsAndCustomArgs> = {
  title: "Components/Organisms/VcPushMessages",
  component: VcPushMessages,
  argTypes: {
    onMarkReadAll: { action: "markReadAll" },
    onMarkUnreadAll: { action: "markUnreadAll" },
    onClearAll: { action: "clearAll" },
  },
};

export default meta;

const Template: StoryFn<VcPushMessagesPropsAndCustomArgs> = (args) => ({
  components: { VcPushMessages, VcPushMessage },
  setup: () => ({ args }),
  template: `
  <VcPushMessages class="inline-block" v-bind="args">
    <template #trigger>
      <span class="p-1.5 rounded bg-neutral-600 text-neutral-100">Click me!</span>
    </template>
    <template #items>
      <VcPushMessage v-for="item in args.items" :key="item.id" :push-message="item" />
    </template>
  </VcPushMessages>`,
});

export const Basic = Template.bind({});
Basic.args = {
  totalCount: 0,
};

export const Items = Template.bind({});
Items.args = {
  totalCount: 5,
  items: [unreadPushMessageMock, unreadPushMessageMock, readPushMessageMock, readPushMessageMock, readPushMessageMock],
};

export const Removable = Template.bind({});
Removable.args = {
  totalCount: 5,
  items: [unreadPushMessageMock, unreadPushMessageMock, readPushMessageMock, readPushMessageMock, readPushMessageMock],
  removable: true,
};

export const Options = Template.bind({});
Options.args = {
  totalCount: 5,
  items: [
    unreadPushMessageMock,
    unreadPushMessageMock,
    unreadPushMessageMock,
    readPushMessageMock,
    readPushMessageMock,
  ],
  removable: true,
  withOptions: true,
};
