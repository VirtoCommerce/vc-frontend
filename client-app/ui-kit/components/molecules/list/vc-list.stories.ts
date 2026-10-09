import { VcList } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcList> = {
  title: "Components/Molecules/VcList",
  component: VcList,
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: () => ({
    template: `<VcList>
      <VcListItem title="Free standard shipping" description="On all orders over $50." />
      <VcListItem title="Easy 30-day returns" description="Return any item within 30 days of purchase." />
      <VcListItem title="24/7 customer support" description="Contact us anytime via chat or email." />
    </VcList>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcList>
            <VcListItem title="Free standard shipping" description="On all orders over $50." />
            <VcListItem title="Easy 30-day returns" description="Return any item within 30 days." />
          </VcList>
        `,
      },
    },
  },
};

export const PlainText: StoryType = {
  render: () => ({
    template: `<VcList>
      <li>First plain item</li>
      <li>Second plain item</li>
      <li>Third plain item</li>
    </VcList>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcList>
            <li>First item</li>
            <li>Second item</li>
          </VcList>
        `,
      },
    },
  },
};
