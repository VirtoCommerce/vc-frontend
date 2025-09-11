import { ref } from "vue";
import { VcVariantPickerGroup } from "..";
import { VcVariantPicker } from "../../molecules";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcVariantPickerGroup",
  component: VcVariantPickerGroup,
  argTypes: {},
} as Meta<typeof VcVariantPickerGroup>;

const Template: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" :name="args.name" value="red" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" value="blue" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" value="green" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" value="yellow" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" value="orange" is-available :active="false" />
  </VcVariantPickerGroup>`,
});

export const Basic = Template.bind({});
Basic.args = {
  name: "basic",
};

const TemplateImage: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-1.webp" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-2.webp" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-3.webp" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-4.webp" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-5.webp" is-available :active="false" />
  </VcVariantPickerGroup>`,
});

export const Images = TemplateImage.bind({});
Images.args = {
  name: "image",
};

const TemplateText: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Size: XS" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Size: SM" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Size: MD" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Size: LG" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Size: XL" is-available :active="false" />
  </VcVariantPickerGroup>`,
});

export const Texts = TemplateText.bind({});
Texts.args = {
  name: "text",
};

const TemplateShowMore: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="red" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="blue" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="yellow" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="orange" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="purple" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="pink" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="brown" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="gray" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="black" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="white" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="cyan" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="magenta" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="lime" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="teal" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="navy" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="maroon" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="olive" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="silver" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="gold" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="#FF5733" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="#33FF57" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="#3357FF" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="#FF33F5" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="#F5FF33" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="#33FFF5" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="#FF8C33" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="#8C33FF" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="#33FF8C" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="#FF3333" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="rgb(255,102,51)" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="rgb(102,255,51)" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="rgb(51,102,255)" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="rgb(255,51,204)" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="rgb(204,255,51)" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="rgb(51,255,204)" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="rgb(153,76,0)" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="rgb(76,0,153)" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="rgb(0,153,76)" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="rgb(153,0,76)" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="crimson" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="coral" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="salmon" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="tomato" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="orangered" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="chocolate" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="peru" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="tan" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="khaki" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="wheat" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="beige" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="ivory" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="lavender" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="plum" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="violet" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="indigo" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="turquoise" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="aqua" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="darkgreen" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="forestgreen" is-available :active="false" />
  </VcVariantPickerGroup>`,
});

export const ShowMoreButton = TemplateShowMore.bind({});
ShowMoreButton.args = {
  truncate: true,
  name: "show-more",
};

const TemplateMixedWidths: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="XS" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Small Size" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Medium" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Large with Extra Text" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="XL" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="XXL Extended Size" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Custom Size with Very Long Text" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="S" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Another Medium Size" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="XXXL Super Large" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Tiny" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Ultra-Wide Extended Size Option" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="A" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="B" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Super Extra Large Size" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Mega Ultra Wide Size with Maximum Text Length for Testing" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="C" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Mini" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Extended Premium Size Option" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="L" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Professional Grade Extended Size" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Z" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Compact" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Enterprise Level Maximum Size Configuration" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Q" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Micro Size" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Premium Plus Extended" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="W" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Ultimate Super Extra Large Premium Size" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Nano" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Commercial Grade Professional Extended Size Option with Maximum Width" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="E" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Regular Standard" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Industrial Premium Size" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="R" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Gigantic Ultra Wide Professional Grade Enterprise Level Size" is-available :active="false" />
  </VcVariantPickerGroup>`,
});

export const MixedWidths = TemplateMixedWidths.bind({});
MixedWidths.args = {
  truncate: true,
  name: "mixed-widths",
};

const TemplateMixedTypes: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="red" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Small Text" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-1.webp" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Very Long Text Option Here" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="green" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="A" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-2.webp" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Extended Size Name" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="yellow" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="XL" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-3.webp" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Ultra-Wide Option with Maximum Text Length" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="orange" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="S" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-4.webp" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="purple" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Mega Wide Professional Enterprise Level Option" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="pink" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-5.webp" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="B" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="teal" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Premium Grade Extended" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-1.webp" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="brown" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Z" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Commercial Professional Ultra Wide Text Option with Maximum Length" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-2.webp" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="gray" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Tiny" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="black" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-3.webp" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Industrial Grade Maximum Size Configuration" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="white" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="C" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-4.webp" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="cyan" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Ultimate Professional Enterprise Level Ultra Wide Premium Option" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="magenta" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-5.webp" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Q" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="lime" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Gigantic Commercial Grade Professional Extended Size" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-1.webp" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="blue" :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="Extra Wide Professional Commercial Text" is-available :active="false" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-2.webp" :active="false" />
  </VcVariantPickerGroup>`,
});

export const MixedTypes = TemplateMixedTypes.bind({});
MixedTypes.args = {
  truncate: true,
  name: "mixed-types",
};

export const OneRow = TemplateMixedWidths.bind({});
OneRow.args = {
  truncate: true,
  maxRows: 1,
  name: "one-row",
};

export const ThreeRows = TemplateShowMore.bind({});
ThreeRows.args = {
  truncate: true,
  maxRows: 3,
  name: "three-rows",
};
