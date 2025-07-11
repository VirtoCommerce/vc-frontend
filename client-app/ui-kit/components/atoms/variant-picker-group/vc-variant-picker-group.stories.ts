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
    <VcVariantPicker v-model="model" name="color" value="red" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" value="blue" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" value="green" :active="false" />
    <VcVariantPicker v-model="model" name="color" value="yellow" :active="false" />
    <VcVariantPicker v-model="model" name="color" value="orange" is-available :active="false" />
  </VcVariantPickerGroup>`,
});

export const Basic = Template.bind({});

const TemplateImage: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" name="color" type="image" value="product-example-1.webp" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="image" value="product-example-2.webp" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="image" value="product-example-3.webp" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="image" value="product-example-4.webp" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="image" value="product-example-5.webp" is-available :active="false" />
  </VcVariantPickerGroup>`,
});

export const Images = TemplateImage.bind({});

const TemplateText: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: XS" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: SM" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: MD" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: LG" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: XL" is-available :active="false" />
  </VcVariantPickerGroup>`,
});

export const Texts = TemplateText.bind({});
