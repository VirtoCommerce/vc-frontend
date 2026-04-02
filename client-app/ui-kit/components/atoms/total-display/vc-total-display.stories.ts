import { VcTotalDisplay } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcTotalDisplay> = {
  title: "Components/Atoms/VcTotalDisplay",
  component: VcTotalDisplay,
  argTypes: {
    amount: {
      control: "number",
      description: "Numeric amount to format and display",
    },
    cultureName: {
      control: "text",
      description: "BCP 47 locale string used for number formatting (e.g. 'en-US', 'de-DE')",
    },
    currencyCode: {
      control: "text",
      description: "ISO 4217 currency code (e.g. 'USD', 'EUR')",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcTotalDisplay v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    amount: 1234.56,
    cultureName: "en-US",
    currencyCode: "USD",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcTotalDisplay :amount="1234.56" culture-name="en-US" currency-code="USD" />`,
      },
    },
  },
};

export const Euro: StoryType = {
  args: {
    amount: 1234.56,
    cultureName: "de-DE",
    currencyCode: "EUR",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcTotalDisplay :amount="1234.56" culture-name="de-DE" currency-code="EUR" />`,
      },
    },
  },
};

export const LargeAmount: StoryType = {
  args: {
    amount: 1_000_000,
    cultureName: "en-US",
    currencyCode: "USD",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcTotalDisplay :amount="1000000" culture-name="en-US" currency-code="USD" />`,
      },
    },
  },
};
