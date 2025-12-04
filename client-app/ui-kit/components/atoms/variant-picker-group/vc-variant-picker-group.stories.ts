import { ref } from "vue";
import { VcVariantPickerGroup } from "..";
import { VcVariantPicker } from "../../molecules";
import type { Meta, StoryFn } from "@storybook/vue3-vite";

export default {
  title: "Components/Atoms/VcVariantPickerGroup",
  component: VcVariantPickerGroup,
  argTypes: {
    selectedValues: {
      control: "object",
      description: "Selected value (string) or array of selected values (string[])",
    },
  },
} as Meta<typeof VcVariantPickerGroup>;

const Template: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue);
    const items = [
      {
        label: "Red",
        value: "red",
        isAvailable: true,
      },
      {
        label: "Blue",
        value: "blue",
        isAvailable: true,
      },
      {
        label: "Green",
        value: "green",
        isAvailable: false,
      },
      {
        label: "Yellow",
        value: "yellow",
        isAvailable: false,
      },
      {
        label: "Orange",
        value: "orange",
        isAvailable: true,
      },
    ];

    return { args, items, model };
  },
  template: `
    <div class="mb-3">Selected: {{ model }}</div>

    <VcVariantPickerGroup v-bind="args" v-model="model">
      <VcVariantPicker v-for="item in items" v-bind="item" />
    </VcVariantPickerGroup>
  `,
});

export const Basic = Template.bind({});
Basic.args = {
  name: "basic",
  type: "color",
  multiple: false,
  modelValue: "red",
};

const TemplateImage: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `
    <div class="mb-3">Selected: {{ model }}</div>

    <VcVariantPickerGroup v-bind="args">
      <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-1.webp" is-available :active="false" />
      <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-2.webp" is-available :active="false" />
      <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-3.webp" :active="false" />
      <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-4.webp" :active="false" />
      <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-5.webp" is-available :active="false" />
    </VcVariantPickerGroup>
  `,
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
  template: `
    <div class="mb-3">Selected: {{ model }}</div>

    <VcVariantPickerGroup v-bind="args">
      <VcVariantPicker v-model="model" :name="args.name" type="text" value="Size: XS" is-available :active="false" />
      <VcVariantPicker v-model="model" :name="args.name" type="text" value="Size: SM" is-available :active="false" />
      <VcVariantPicker v-model="model" :name="args.name" type="text" value="Size: MD" :active="false" />
      <VcVariantPicker v-model="model" :name="args.name" type="text" value="Size: LG" :active="false" />
      <VcVariantPicker v-model="model" :name="args.name" type="text" value="Size: XL" is-available :active="false" />
    </VcVariantPickerGroup>
  `,
});

export const Texts = TemplateText.bind({});
Texts.args = {
  name: "text",
};

const TemplateMultiselect: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue);

    return {
      args,
      model,
    };
  },
  template: `
    <div>
      <div class="mb-4">
        <strong>Selected values: </strong>
        <span v-if="Array.isArray(model) && model.length === 0" class="text-gray-500">Nothing selected</span>
        <span v-else-if="Array.isArray(model)" class="text-blue-600">{{ model.join(', ') }}</span>
        <span v-else class="text-blue-600">{{ model }}</span>
      </div>

      <VcVariantPickerGroup v-bind="args" v-model="model">
        <VcVariantPicker
          :name="args.name"
          value="red"
          is-available
        />

        <VcVariantPicker
          :name="args.name"
          value="blue"
          is-available
        />

        <VcVariantPicker
          :name="args.name"
          value="green"
        />

        <VcVariantPicker
          :name="args.name"
          value="yellow"
        />
      </VcVariantPickerGroup>
    </div>
  `,
});

export const Multiselect = TemplateMultiselect.bind({});
Multiselect.args = {
  name: "multiselect",
  multiple: true,
};

export const SingleSelect = TemplateMultiselect.bind({});
SingleSelect.args = {
  name: "single-select",
  modelValue: "red",
  multiple: false,
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

const TemplateTooltips: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="red" is-available tooltip="Red" />
    <VcVariantPicker v-model="model" :name="args.name" type="image" value="product-example-1.webp" is-available>
      <template #tooltip>
        <span>Image 1</span>
      </template>
    </VcVariantPicker>
    <VcVariantPicker v-model="model" :name="args.name" type="text" value="XL" tooltip="Extra Large" />
    <VcVariantPicker v-model="model" :name="args.name" type="color" value="blue">
      <template #tooltip>
        <span>Custom Blue</span>
      </template>
    </VcVariantPicker>
  </VcVariantPickerGroup>`,
});

export const Tooltips = TemplateTooltips.bind({});
Tooltips.args = {
  name: "tooltips",
};

const TemplateMultiColor: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" :name="args.name" :value="['red', 'blue']" is-available tooltip="Red & Blue" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['green', 'yellow']" is-available tooltip="Green & Yellow" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['orange', 'purple']" tooltip="Orange & Purple" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['pink', 'cyan']" is-available tooltip="Pink & Cyan" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['red', 'green', 'blue']" is-available tooltip="RGB" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['yellow', 'magenta', 'cyan']" tooltip="CMY" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['red', 'orange', 'yellow', 'green']" is-available tooltip="Warm Colors" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']" is-available tooltip="Custom Mix" />
  </VcVariantPickerGroup>`,
});

export const MultiColor = TemplateMultiColor.bind({});
MultiColor.args = {
  name: "multicolor",
};

const TemplateMultiColorShowMore: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" :name="args.name" value="red" is-available tooltip="Solid Red" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['red', 'blue']" is-available tooltip="Red & Blue" />
    <VcVariantPicker v-model="model" :name="args.name" value="green" is-available tooltip="Solid Green" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['yellow', 'orange']" is-available tooltip="Yellow & Orange" />
    <VcVariantPicker v-model="model" :name="args.name" value="purple" is-available tooltip="Solid Purple" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['pink', 'purple', 'blue']" is-available tooltip="Pink, Purple & Blue" />
    <VcVariantPicker v-model="model" :name="args.name" value="cyan" tooltip="Solid Cyan" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['red', 'orange', 'yellow', 'green']" is-available tooltip="Rainbow" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['black', 'white']" is-available tooltip="Black & White" />
    <VcVariantPicker v-model="model" :name="args.name" value="brown" tooltip="Solid Brown" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['brown', 'beige']" is-available tooltip="Brown & Beige" />
    <VcVariantPicker v-model="model" :name="args.name" value="gray" is-available tooltip="Solid Gray" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['navy', 'white', 'red']" is-available tooltip="Nautical" />
    <VcVariantPicker v-model="model" :name="args.name" value="olive" tooltip="Solid Olive" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['gold', 'silver']" is-available tooltip="Gold & Silver" />
    <VcVariantPicker v-model="model" :name="args.name" value="maroon" is-available tooltip="Solid Maroon" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['crimson', 'coral', 'salmon']" tooltip="Coral Tones" />
    <VcVariantPicker v-model="model" :name="args.name" value="teal" is-available tooltip="Solid Teal" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['lime', 'green', 'teal', 'cyan']" is-available tooltip="Green Spectrum" />
    <VcVariantPicker v-model="model" :name="args.name" value="violet" tooltip="Solid Violet" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['#FF6B6B', '#4ECDC4']" is-available tooltip="Custom Duo 1" />
    <VcVariantPicker v-model="model" :name="args.name" value="#45B7D1" is-available tooltip="Custom Blue" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['#FFA07A', '#98D8C8', '#F7DC6F']" tooltip="Pastel Mix" />
    <VcVariantPicker v-model="model" :name="args.name" value="indigo" is-available tooltip="Solid Indigo" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['indigo', 'violet', 'purple', 'magenta']" is-available tooltip="Purple Spectrum" />
    <VcVariantPicker v-model="model" :name="args.name" value="turquoise" tooltip="Solid Turquoise" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['aqua', 'turquoise']" is-available tooltip="Aqua Mix" />
    <VcVariantPicker v-model="model" :name="args.name" value="salmon" is-available tooltip="Solid Salmon" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['salmon', 'coral', 'peachpuff']" tooltip="Peachy Tones" />
    <VcVariantPicker v-model="model" :name="args.name" value="khaki" is-available tooltip="Solid Khaki" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['khaki', 'tan', 'beige', 'wheat']" is-available tooltip="Earth Tones" />
    <VcVariantPicker v-model="model" :name="args.name" value="plum" tooltip="Solid Plum" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['plum', 'orchid']" is-available tooltip="Plum & Orchid" />
    <VcVariantPicker v-model="model" :name="args.name" value="chocolate" is-available tooltip="Solid Chocolate" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['chocolate', 'sienna', 'peru']" tooltip="Brown Spectrum" />
    <VcVariantPicker v-model="model" :name="args.name" value="orange" is-available tooltip="Solid Orange" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['orange', 'red']" is-available tooltip="Warm Duo" />
    <VcVariantPicker v-model="model" :name="args.name" value="yellow" tooltip="Solid Yellow" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['blue', 'cyan', 'teal']" is-available tooltip="Ocean Tones" />
    <VcVariantPicker v-model="model" :name="args.name" value="magenta" is-available tooltip="Solid Magenta" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['pink', 'coral']" tooltip="Pink & Coral" />
    <VcVariantPicker v-model="model" :name="args.name" value="navy" is-available tooltip="Solid Navy" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['gray', 'silver', 'white']" is-available tooltip="Silver Spectrum" />
    <VcVariantPicker v-model="model" :name="args.name" value="lime" tooltip="Solid Lime" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['crimson', 'maroon']" is-available tooltip="Deep Reds" />
    <VcVariantPicker v-model="model" :name="args.name" value="coral" is-available tooltip="Solid Coral" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['yellow', 'gold', 'orange', 'red']" tooltip="Fire Spectrum" />
    <VcVariantPicker v-model="model" :name="args.name" value="peru" is-available tooltip="Solid Peru" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['lavender', 'purple']" is-available tooltip="Lavender & Purple" />
    <VcVariantPicker v-model="model" :name="args.name" value="sienna" tooltip="Solid Sienna" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['teal', 'turquoise', 'cyan', 'aqua']" is-available tooltip="Aquatic Colors" />
    <VcVariantPicker v-model="model" :name="args.name" value="tan" is-available tooltip="Solid Tan" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['red', 'pink']" tooltip="Red & Pink" />
    <VcVariantPicker v-model="model" :name="args.name" value="wheat" is-available tooltip="Solid Wheat" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['blue', 'indigo', 'violet']" is-available tooltip="Blue-Violet Mix" />
    <VcVariantPicker v-model="model" :name="args.name" value="orchid" tooltip="Solid Orchid" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['green', 'lime', 'yellow']" is-available tooltip="Spring Colors" />
    <VcVariantPicker v-model="model" :name="args.name" value="tomato" is-available tooltip="Solid Tomato" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['brown', 'chocolate', 'sienna', 'peru']" tooltip="Chocolate Spectrum" />
    <VcVariantPicker v-model="model" :name="args.name" value="#E91E63" is-available tooltip="Custom Pink" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['#9C27B0', '#673AB7']" tooltip="Custom Purple Duo" />
    <VcVariantPicker v-model="model" :name="args.name" value="#00BCD4" is-available tooltip="Custom Cyan" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['#FF5722', '#FF9800', '#FFC107']" is-available tooltip="Custom Orange Mix" />
    <VcVariantPicker v-model="model" :name="args.name" value="#8BC34A" tooltip="Custom Light Green" />
    <VcVariantPicker v-model="model" :name="args.name" :value="['#3F51B5', '#2196F3', '#03A9F4', '#00BCD4']" is-available tooltip="Custom Blue Gradient" />
  </VcVariantPickerGroup>`,
});

export const MultiColorShowMore = TemplateMultiColorShowMore.bind({});
MultiColorShowMore.args = {
  truncate: true,
  name: "multicolor-show-more",
};

const TemplateMultiColorSizes: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `
    <div class="space-y-6">
      <div>
        <h3 class="mb-2 text-sm font-bold">Size: XXS</h3>
        <VcVariantPickerGroup v-bind="args">
          <VcVariantPicker v-model="model" :name="args.name" size="xxs" :value="['red', 'blue']" is-available tooltip="Red & Blue" />
          <VcVariantPicker v-model="model" :name="args.name" size="xxs" :value="['green', 'yellow']" is-available tooltip="Green & Yellow" />
          <VcVariantPicker v-model="model" :name="args.name" size="xxs" :value="['orange', 'purple']" tooltip="Orange & Purple" />
          <VcVariantPicker v-model="model" :name="args.name" size="xxs" :value="['pink', 'cyan']" is-available tooltip="Pink & Cyan" />
          <VcVariantPicker v-model="model" :name="args.name" size="xxs" :value="['red', 'green', 'blue']" is-available tooltip="RGB" />
          <VcVariantPicker v-model="model" :name="args.name" size="xxs" :value="['yellow', 'magenta', 'cyan']" tooltip="CMY" />
          <VcVariantPicker v-model="model" :name="args.name" size="xxs" :value="['brown', 'beige', 'tan']" is-available tooltip="Earth Tones" />
          <VcVariantPicker v-model="model" :name="args.name" size="xxs" :value="['purple', 'pink', 'magenta', 'violet']" tooltip="Purple Mix" />
          <VcVariantPicker v-model="model" :name="args.name" size="xxs" :value="['red', 'orange', 'yellow', 'green']" is-available tooltip="Rainbow" />
          <VcVariantPicker v-model="model" :name="args.name" size="xxs" :value="['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']" is-available tooltip="Custom Mix" />
        </VcVariantPickerGroup>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-bold">Size: XS</h3>
        <VcVariantPickerGroup v-bind="args">
          <VcVariantPicker v-model="model" :name="args.name" size="xs" :value="['red', 'blue']" is-available tooltip="Red & Blue" />
          <VcVariantPicker v-model="model" :name="args.name" size="xs" :value="['green', 'yellow']" is-available tooltip="Green & Yellow" />
          <VcVariantPicker v-model="model" :name="args.name" size="xs" :value="['orange', 'purple']" tooltip="Orange & Purple" />
          <VcVariantPicker v-model="model" :name="args.name" size="xs" :value="['pink', 'cyan']" is-available tooltip="Pink & Cyan" />
          <VcVariantPicker v-model="model" :name="args.name" size="xs" :value="['red', 'green', 'blue']" is-available tooltip="RGB" />
          <VcVariantPicker v-model="model" :name="args.name" size="xs" :value="['yellow', 'magenta', 'cyan']" tooltip="CMY" />
          <VcVariantPicker v-model="model" :name="args.name" size="xs" :value="['brown', 'beige', 'tan']" is-available tooltip="Earth Tones" />
          <VcVariantPicker v-model="model" :name="args.name" size="xs" :value="['purple', 'pink', 'magenta', 'violet']" tooltip="Purple Mix" />
          <VcVariantPicker v-model="model" :name="args.name" size="xs" :value="['red', 'orange', 'yellow', 'green']" is-available tooltip="Rainbow" />
          <VcVariantPicker v-model="model" :name="args.name" size="xs" :value="['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']" is-available tooltip="Custom Mix" />
        </VcVariantPickerGroup>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-bold">Size: SM</h3>
        <VcVariantPickerGroup v-bind="args">
          <VcVariantPicker v-model="model" :name="args.name" size="sm" :value="['red', 'blue']" is-available tooltip="Red & Blue" />
          <VcVariantPicker v-model="model" :name="args.name" size="sm" :value="['green', 'yellow']" is-available tooltip="Green & Yellow" />
          <VcVariantPicker v-model="model" :name="args.name" size="sm" :value="['orange', 'purple']" tooltip="Orange & Purple" />
          <VcVariantPicker v-model="model" :name="args.name" size="sm" :value="['pink', 'cyan']" is-available tooltip="Pink & Cyan" />
          <VcVariantPicker v-model="model" :name="args.name" size="sm" :value="['red', 'green', 'blue']" is-available tooltip="RGB" />
          <VcVariantPicker v-model="model" :name="args.name" size="sm" :value="['yellow', 'magenta', 'cyan']" tooltip="CMY" />
          <VcVariantPicker v-model="model" :name="args.name" size="sm" :value="['brown', 'beige', 'tan']" is-available tooltip="Earth Tones" />
          <VcVariantPicker v-model="model" :name="args.name" size="sm" :value="['purple', 'pink', 'magenta', 'violet']" tooltip="Purple Mix" />
          <VcVariantPicker v-model="model" :name="args.name" size="sm" :value="['red', 'orange', 'yellow', 'green']" is-available tooltip="Rainbow" />
          <VcVariantPicker v-model="model" :name="args.name" size="sm" :value="['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']" is-available tooltip="Custom Mix" />
        </VcVariantPickerGroup>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-bold">Size: MD (default)</h3>
        <VcVariantPickerGroup v-bind="args">
          <VcVariantPicker v-model="model" :name="args.name" size="md" :value="['red', 'blue']" is-available tooltip="Red & Blue" />
          <VcVariantPicker v-model="model" :name="args.name" size="md" :value="['green', 'yellow']" is-available tooltip="Green & Yellow" />
          <VcVariantPicker v-model="model" :name="args.name" size="md" :value="['orange', 'purple']" tooltip="Orange & Purple" />
          <VcVariantPicker v-model="model" :name="args.name" size="md" :value="['pink', 'cyan']" is-available tooltip="Pink & Cyan" />
          <VcVariantPicker v-model="model" :name="args.name" size="md" :value="['red', 'green', 'blue']" is-available tooltip="RGB" />
          <VcVariantPicker v-model="model" :name="args.name" size="md" :value="['yellow', 'magenta', 'cyan']" tooltip="CMY" />
          <VcVariantPicker v-model="model" :name="args.name" size="md" :value="['brown', 'beige', 'tan']" is-available tooltip="Earth Tones" />
          <VcVariantPicker v-model="model" :name="args.name" size="md" :value="['purple', 'pink', 'magenta', 'violet']" tooltip="Purple Mix" />
          <VcVariantPicker v-model="model" :name="args.name" size="md" :value="['red', 'orange', 'yellow', 'green']" is-available tooltip="Rainbow" />
          <VcVariantPicker v-model="model" :name="args.name" size="md" :value="['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']" is-available tooltip="Custom Mix" />
        </VcVariantPickerGroup>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-bold">Size: LG</h3>
        <VcVariantPickerGroup v-bind="args">
          <VcVariantPicker v-model="model" :name="args.name" size="lg" :value="['red', 'blue']" is-available tooltip="Red & Blue" />
          <VcVariantPicker v-model="model" :name="args.name" size="lg" :value="['green', 'yellow']" is-available tooltip="Green & Yellow" />
          <VcVariantPicker v-model="model" :name="args.name" size="lg" :value="['orange', 'purple']" tooltip="Orange & Purple" />
          <VcVariantPicker v-model="model" :name="args.name" size="lg" :value="['pink', 'cyan']" is-available tooltip="Pink & Cyan" />
          <VcVariantPicker v-model="model" :name="args.name" size="lg" :value="['red', 'green', 'blue']" is-available tooltip="RGB" />
          <VcVariantPicker v-model="model" :name="args.name" size="lg" :value="['yellow', 'magenta', 'cyan']" tooltip="CMY" />
          <VcVariantPicker v-model="model" :name="args.name" size="lg" :value="['brown', 'beige', 'tan']" is-available tooltip="Earth Tones" />
          <VcVariantPicker v-model="model" :name="args.name" size="lg" :value="['purple', 'pink', 'magenta', 'violet']" tooltip="Purple Mix" />
          <VcVariantPicker v-model="model" :name="args.name" size="lg" :value="['red', 'orange', 'yellow', 'green']" is-available tooltip="Rainbow" />
          <VcVariantPicker v-model="model" :name="args.name" size="lg" :value="['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']" is-available tooltip="Custom Mix" />
        </VcVariantPickerGroup>
      </div>
    </div>
  `,
});

export const MultiColorSizes = TemplateMultiColorSizes.bind({});
MultiColorSizes.args = {
  name: "multicolor-sizes",
};

const TemplateMultiColorMultiSelect: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue);

    const options = [
      { value: "red", label: "Red" },
      { value: ["red", "blue"], label: "Red & Blue" },
      { value: "green", label: "Green" },
      { value: ["yellow", "orange"], label: "Yellow & Orange" },
      { value: ["red", "green", "blue"], label: "RGB" },
      { value: "purple", label: "Purple" },
      { value: ["pink", "purple", "magenta", "violet"], label: "Purple Mix" },
    ];

    return { args, model, options };
  },
  template: `
    <div class="space-y-4">
      <div>
        <div class="mb-2 text-sm font-bold">Selected: {{ JSON.stringify(model) }}</div>

        <VcVariantPickerGroup v-bind="args" v-model="model">
          <VcVariantPicker
            v-for="(option, index) in options"
            :key="index"
            :value="option.value"
            :name="args.name"
            :is-available="true"
            :tooltip="option.label"
          />
        </VcVariantPickerGroup>
      </div>
    </div>
  `,
});

export const MultiColorMultiSelect = TemplateMultiColorMultiSelect.bind({});
MultiColorMultiSelect.args = {
  name: "multicolor-multi",
  modelValue: [["red", "blue"], "green"],
  multiple: true,
  type: "color",
};

export const MultiColorSingleSelect = TemplateMultiColorMultiSelect.bind({});
MultiColorSingleSelect.args = {
  name: "multicolor-single",
  modelValue: undefined,
  multiple: false,
  size: "sm",
  type: "color",
};
