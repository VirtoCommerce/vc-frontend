import { VcNotifications } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcNotifications",
  component: VcNotifications,
} as Meta<typeof VcNotifications>;

const Template: StoryFn<typeof VcNotifications> = (args) => ({
  components: { VcNotifications },
  setup: () => ({ args }),
  template: '<VcNotifications v-bind="args" />',
});

export const Basic = Template.bind({});

export const Notifications = Template.bind({});
Notifications.args = {
  items: [
    {
      id: "1",
      text: 'You have <b>40 items</b> in your cart, don\'t forget to <b><a href="/cart">checkout</a></b>.',
      read: false,
      createdDate: new Date("2024-02-28T07:58:19.1545801Z"),
    },
    {
      id: "2",
      text: "**31 new agencies** are available on **OMNIA** Partners Connect 31 new agencies are available on OMNIA. **Partners** Connect 31 new agencies are available on OMNIA Partners Connect",
      read: true,
      createdDate: new Date("2024-02-28T07:58:19.1545801Z"),
    },
  ],
};
