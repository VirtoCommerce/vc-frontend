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


const TemplateShowMore: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref();
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-bind="args">
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 1" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 2" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 3" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 4" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 5" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 6" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 7" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 8" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 9" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 10" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 11" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 12" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 13" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 14" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 15" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 16" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 17" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 18" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 19" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 20" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 21" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 22" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 23" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 24" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 25" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 26" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 27" is-available :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 28" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 29" :active="false" />
    <VcVariantPicker v-model="model" name="color" type="text" value="Size: 30" is-available :active="false" />
  </VcVariantPickerGroup>`,
});

export const ShowMoreButton = TemplateShowMore.bind({});
ShowMoreButton.args = {
  truncate: true,
}
