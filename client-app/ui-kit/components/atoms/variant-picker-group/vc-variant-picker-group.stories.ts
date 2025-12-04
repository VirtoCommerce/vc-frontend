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
  type: "color",
  multiple: false,
  modelValue: "red",
};

const TemplateImage: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue);
    return { args, model };
  },
  template: `
    <div class="mb-3">Selected: {{ model }}</div>

    <VcVariantPickerGroup v-model="model" v-bind="args">
      <VcVariantPicker type="image" value="product-example-1.webp" is-available />
      <VcVariantPicker type="image" value="product-example-2.webp" is-available />
      <VcVariantPicker type="image" value="product-example-3.webp" />
      <VcVariantPicker type="image" value="product-example-4.webp" />
      <VcVariantPicker type="image" value="product-example-5.webp" is-available />
    </VcVariantPickerGroup>
  `,
});

export const Images = TemplateImage.bind({});
Images.args = {
  type: "image",
  multiple: false,
  modelValue: "product-example-1.webp",
};

const TemplateText: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue);
    return { args, model };
  },
  template: `
    <div class="mb-3">Selected: {{ model }}</div>

    <VcVariantPickerGroup v-model="model" v-bind="args">
      <VcVariantPicker type="text" value="Size: XS" is-available />
      <VcVariantPicker type="text" value="Size: SM" is-available />
      <VcVariantPicker type="text" value="Size: MD" />
      <VcVariantPicker type="text" value="Size: LG" />
      <VcVariantPicker type="text" value="Size: XL" is-available />
    </VcVariantPickerGroup>
  `,
});

export const Texts = TemplateText.bind({});
Texts.args = {
  type: "text",
  multiple: false,
  modelValue: "Size: XS",
};

const TemplateMultiselect: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue ?? (args.multiple ? [] : ""));

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

      <VcVariantPickerGroup v-model="model" v-bind="args">
        <VcVariantPicker value="red" is-available />
        <VcVariantPicker value="blue" is-available />
        <VcVariantPicker value="green" />
        <VcVariantPicker value="yellow" />
      </VcVariantPickerGroup>
    </div>
  `,
});

export const Multiselect = TemplateMultiselect.bind({});
Multiselect.args = {
  type: "color",
  multiple: true,
  modelValue: [],
};

export const SingleSelect = TemplateMultiselect.bind({});
SingleSelect.args = {
  type: "color",
  multiple: false,
  modelValue: "red",
};

const TemplateShowMore: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue ?? "");
    const items = [
      { value: "red", isAvailable: true },
      { value: "blue", isAvailable: true },
      { value: "yellow", isAvailable: false },
      { value: "orange", isAvailable: true },
      { value: "purple", isAvailable: true },
      { value: "pink", isAvailable: true },
      { value: "brown", isAvailable: false },
      { value: "gray", isAvailable: false },
      { value: "black", isAvailable: true },
      { value: "white", isAvailable: true },
      { value: "cyan", isAvailable: true },
      { value: "magenta", isAvailable: false },
      { value: "lime", isAvailable: false },
      { value: "teal", isAvailable: true },
      { value: "navy", isAvailable: true },
      { value: "maroon", isAvailable: true },
      { value: "olive", isAvailable: false },
      { value: "silver", isAvailable: false },
      { value: "gold", isAvailable: true },
      { value: "#FF5733", isAvailable: true },
      { value: "#33FF57", isAvailable: true },
      { value: "#3357FF", isAvailable: false },
      { value: "#FF33F5", isAvailable: false },
      { value: "#F5FF33", isAvailable: true },
      { value: "#33FFF5", isAvailable: true },
      { value: "#FF8C33", isAvailable: true },
      { value: "#8C33FF", isAvailable: false },
      { value: "#33FF8C", isAvailable: false },
      { value: "#FF3333", isAvailable: true },
      { value: "rgb(255,102,51)", isAvailable: true },
      { value: "rgb(102,255,51)", isAvailable: true },
      { value: "rgb(51,102,255)", isAvailable: false },
      { value: "rgb(255,51,204)", isAvailable: false },
      { value: "rgb(204,255,51)", isAvailable: true },
      { value: "rgb(51,255,204)", isAvailable: true },
      { value: "rgb(153,76,0)", isAvailable: true },
      { value: "rgb(76,0,153)", isAvailable: false },
      { value: "rgb(0,153,76)", isAvailable: false },
      { value: "rgb(153,0,76)", isAvailable: true },
      { value: "crimson", isAvailable: true },
      { value: "coral", isAvailable: true },
      { value: "salmon", isAvailable: false },
      { value: "tomato", isAvailable: false },
      { value: "orangered", isAvailable: true },
      { value: "chocolate", isAvailable: true },
      { value: "peru", isAvailable: true },
      { value: "tan", isAvailable: false },
      { value: "khaki", isAvailable: false },
      { value: "wheat", isAvailable: true },
      { value: "beige", isAvailable: true },
      { value: "ivory", isAvailable: true },
      { value: "lavender", isAvailable: false },
      { value: "plum", isAvailable: false },
      { value: "violet", isAvailable: true },
      { value: "indigo", isAvailable: true },
      { value: "turquoise", isAvailable: true },
      { value: "aqua", isAvailable: false },
      { value: "darkgreen", isAvailable: false },
      { value: "forestgreen", isAvailable: true },
    ];
    return { args, model, items };
  },
  template: `<VcVariantPickerGroup v-model="model" v-bind="args">
    <VcVariantPicker v-for="(item, index) in items" :key="index" type="color" :value="item.value" :is-available="item.isAvailable" />
  </VcVariantPickerGroup>`,
});

export const ShowMoreButton = TemplateShowMore.bind({});
ShowMoreButton.args = {
  type: "color",
  multiple: false,
  truncate: true,
  modelValue: "",
};

const TemplateMixedWidths: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue ?? "");
    const items = [
      { value: "XS", isAvailable: true },
      { value: "Small Size", isAvailable: true },
      { value: "Medium", isAvailable: false },
      { value: "Large with Extra Text", isAvailable: false },
      { value: "XL", isAvailable: true },
      { value: "XXL Extended Size", isAvailable: true },
      { value: "Custom Size with Very Long Text", isAvailable: true },
      { value: "S", isAvailable: false },
      { value: "Another Medium Size", isAvailable: false },
      { value: "XXXL Super Large", isAvailable: true },
      { value: "Tiny", isAvailable: true },
      { value: "Ultra-Wide Extended Size Option", isAvailable: true },
      { value: "A", isAvailable: false },
      { value: "B", isAvailable: false },
      { value: "Super Extra Large Size", isAvailable: true },
      { value: "Mega Ultra Wide Size with Maximum Text Length for Testing", isAvailable: true },
      { value: "C", isAvailable: false },
      { value: "Mini", isAvailable: false },
      { value: "Extended Premium Size Option", isAvailable: true },
      { value: "L", isAvailable: true },
      { value: "Professional Grade Extended Size", isAvailable: true },
      { value: "Z", isAvailable: false },
      { value: "Compact", isAvailable: false },
      { value: "Enterprise Level Maximum Size Configuration", isAvailable: true },
      { value: "Q", isAvailable: true },
      { value: "Micro Size", isAvailable: true },
      { value: "Premium Plus Extended", isAvailable: false },
      { value: "W", isAvailable: false },
      { value: "Ultimate Super Extra Large Premium Size", isAvailable: true },
      { value: "Nano", isAvailable: true },
      { value: "Commercial Grade Professional Extended Size Option with Maximum Width", isAvailable: true },
      { value: "E", isAvailable: false },
      { value: "Regular Standard", isAvailable: false },
      { value: "Industrial Premium Size", isAvailable: true },
      { value: "R", isAvailable: true },
      { value: "Gigantic Ultra Wide Professional Grade Enterprise Level Size", isAvailable: true },
    ];
    return { args, model, items };
  },
  template: `<VcVariantPickerGroup v-model="model" v-bind="args">
    <VcVariantPicker v-for="(item, index) in items" :key="index" type="text" :value="item.value" :is-available="item.isAvailable" />
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
    const model = ref<string | string[]>(args.modelValue ?? "");
    const items = [
      { type: "color", value: "red", isAvailable: true },
      { type: "text", value: "Small Text", isAvailable: true },
      { type: "image", value: "product-example-1.webp", isAvailable: false },
      { type: "text", value: "Very Long Text Option Here", isAvailable: false },
      { type: "color", value: "green", isAvailable: true },
      { type: "text", value: "A", isAvailable: true },
      { type: "image", value: "product-example-2.webp", isAvailable: true },
      { type: "text", value: "Extended Size Name", isAvailable: true },
      { type: "color", value: "yellow", isAvailable: false },
      { type: "text", value: "XL", isAvailable: false },
      { type: "image", value: "product-example-3.webp", isAvailable: true },
      { type: "text", value: "Ultra-Wide Option with Maximum Text Length", isAvailable: true },
      { type: "color", value: "orange", isAvailable: true },
      { type: "text", value: "S", isAvailable: true },
      { type: "image", value: "product-example-4.webp", isAvailable: false },
      { type: "color", value: "purple", isAvailable: true },
      { type: "text", value: "Mega Wide Professional Enterprise Level Option", isAvailable: false },
      { type: "color", value: "pink", isAvailable: false },
      { type: "image", value: "product-example-5.webp", isAvailable: true },
      { type: "text", value: "B", isAvailable: true },
      { type: "color", value: "teal", isAvailable: true },
      { type: "text", value: "Premium Grade Extended", isAvailable: false },
      { type: "image", value: "product-example-1.webp", isAvailable: false },
      { type: "color", value: "brown", isAvailable: false },
      { type: "text", value: "Z", isAvailable: true },
      { type: "text", value: "Commercial Professional Ultra Wide Text Option with Maximum Length", isAvailable: true },
      { type: "image", value: "product-example-2.webp", isAvailable: false },
      { type: "color", value: "gray", isAvailable: false },
      { type: "text", value: "Tiny", isAvailable: false },
      { type: "color", value: "black", isAvailable: true },
      { type: "image", value: "product-example-3.webp", isAvailable: true },
      { type: "text", value: "Industrial Grade Maximum Size Configuration", isAvailable: true },
      { type: "color", value: "white", isAvailable: false },
      { type: "text", value: "C", isAvailable: false },
      { type: "image", value: "product-example-4.webp", isAvailable: true },
      { type: "color", value: "cyan", isAvailable: true },
      { type: "text", value: "Ultimate Professional Enterprise Level Ultra Wide Premium Option", isAvailable: true },
      { type: "color", value: "magenta", isAvailable: false },
      { type: "image", value: "product-example-5.webp", isAvailable: false },
      { type: "text", value: "Q", isAvailable: false },
      { type: "color", value: "lime", isAvailable: true },
      { type: "text", value: "Gigantic Commercial Grade Professional Extended Size", isAvailable: false },
      { type: "image", value: "product-example-1.webp", isAvailable: true },
      { type: "color", value: "blue", isAvailable: false },
      { type: "text", value: "Extra Wide Professional Commercial Text", isAvailable: true },
      { type: "image", value: "product-example-2.webp", isAvailable: false },
    ];
    return { args, model, items };
  },
  template: `<VcVariantPickerGroup v-model="model" v-bind="args">
    <VcVariantPicker v-for="(item, index) in items" :key="index" :type="item.type" :value="item.value" :is-available="item.isAvailable" />
  </VcVariantPickerGroup>`,
});

export const MixedTypes = TemplateMixedTypes.bind({});
MixedTypes.args = {
  multiple: false,
  truncate: true,
  modelValue: "",
};

export const OneRow = TemplateMixedWidths.bind({});
OneRow.args = {
  type: "text",
  multiple: false,
  truncate: true,
  maxRows: 1,
  modelValue: "",
};

export const ThreeRows = TemplateShowMore.bind({});
ThreeRows.args = {
  type: "color",
  multiple: false,
  truncate: true,
  maxRows: 3,
  modelValue: "",
};

const TemplateTooltips: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue ?? "");
    const items = [
      { type: "color", value: "red", isAvailable: true, tooltip: "Red" },
      { type: "image", value: "product-example-1.webp", isAvailable: true, tooltip: "Image 1" },
      { type: "text", value: "XL", isAvailable: false, tooltip: "Extra Large" },
      { type: "color", value: "blue", isAvailable: false, tooltip: "Custom Blue" },
    ];
    return { args, model, items };
  },
  template: `<VcVariantPickerGroup v-model="model" v-bind="args">
    <VcVariantPicker v-for="(item, index) in items" :key="index" :type="item.type" :value="item.value" :is-available="item.isAvailable" :tooltip="item.tooltip" />
  </VcVariantPickerGroup>`,
});

export const Tooltips = TemplateTooltips.bind({});
Tooltips.args = {
  multiple: false,
  modelValue: "",
};

const TemplateMultiColor: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue ?? "");
    return { args, model };
  },
  template: `<VcVariantPickerGroup v-model="model" v-bind="args">
    <VcVariantPicker :value="['red', 'blue']" is-available tooltip="Red & Blue" />
    <VcVariantPicker :value="['green', 'yellow']" is-available tooltip="Green & Yellow" />
    <VcVariantPicker :value="['orange', 'purple']" tooltip="Orange & Purple" />
    <VcVariantPicker :value="['pink', 'cyan']" is-available tooltip="Pink & Cyan" />
    <VcVariantPicker :value="['red', 'green', 'blue']" is-available tooltip="RGB" />
    <VcVariantPicker :value="['yellow', 'magenta', 'cyan']" tooltip="CMY" />
    <VcVariantPicker :value="['red', 'orange', 'yellow', 'green']" is-available tooltip="Warm Colors" />
    <VcVariantPicker :value="['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']" is-available tooltip="Custom Mix" />
  </VcVariantPickerGroup>`,
});

export const MultiColor = TemplateMultiColor.bind({});
MultiColor.args = {
  type: "color",
  multiple: false,
  modelValue: "",
};

const TemplateMultiColorShowMore: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>(args.modelValue ?? "");
    const items = [
      { value: "red", isAvailable: true, tooltip: "Solid Red" },
      { value: ["red", "blue"], isAvailable: true, tooltip: "Red & Blue" },
      { value: "green", isAvailable: true, tooltip: "Solid Green" },
      { value: ["yellow", "orange"], isAvailable: true, tooltip: "Yellow & Orange" },
      { value: "purple", isAvailable: true, tooltip: "Solid Purple" },
      { value: ["pink", "purple", "blue"], isAvailable: true, tooltip: "Pink, Purple & Blue" },
      { value: "cyan", isAvailable: false, tooltip: "Solid Cyan" },
      { value: ["red", "orange", "yellow", "green"], isAvailable: true, tooltip: "Rainbow" },
      { value: ["black", "white"], isAvailable: true, tooltip: "Black & White" },
      { value: "brown", isAvailable: false, tooltip: "Solid Brown" },
      { value: ["brown", "beige"], isAvailable: true, tooltip: "Brown & Beige" },
      { value: "gray", isAvailable: true, tooltip: "Solid Gray" },
      { value: ["navy", "white", "red"], isAvailable: true, tooltip: "Nautical" },
      { value: "olive", isAvailable: false, tooltip: "Solid Olive" },
      { value: ["gold", "silver"], isAvailable: true, tooltip: "Gold & Silver" },
      { value: "maroon", isAvailable: true, tooltip: "Solid Maroon" },
      { value: ["crimson", "coral", "salmon"], isAvailable: false, tooltip: "Coral Tones" },
      { value: "teal", isAvailable: true, tooltip: "Solid Teal" },
      { value: ["lime", "green", "teal", "cyan"], isAvailable: true, tooltip: "Green Spectrum" },
      { value: "violet", isAvailable: false, tooltip: "Solid Violet" },
      { value: ["#FF6B6B", "#4ECDC4"], isAvailable: true, tooltip: "Custom Duo 1" },
      { value: "#45B7D1", isAvailable: true, tooltip: "Custom Blue" },
      { value: ["#FFA07A", "#98D8C8", "#F7DC6F"], isAvailable: false, tooltip: "Pastel Mix" },
      { value: "indigo", isAvailable: true, tooltip: "Solid Indigo" },
      { value: ["indigo", "violet", "purple", "magenta"], isAvailable: true, tooltip: "Purple Spectrum" },
      { value: "turquoise", isAvailable: false, tooltip: "Solid Turquoise" },
      { value: ["aqua", "turquoise"], isAvailable: true, tooltip: "Aqua Mix" },
      { value: "salmon", isAvailable: true, tooltip: "Solid Salmon" },
      { value: ["salmon", "coral", "peachpuff"], isAvailable: false, tooltip: "Peachy Tones" },
      { value: "khaki", isAvailable: true, tooltip: "Solid Khaki" },
      { value: ["khaki", "tan", "beige", "wheat"], isAvailable: true, tooltip: "Earth Tones" },
      { value: "plum", isAvailable: false, tooltip: "Solid Plum" },
      { value: ["plum", "orchid"], isAvailable: true, tooltip: "Plum & Orchid" },
      { value: "chocolate", isAvailable: true, tooltip: "Solid Chocolate" },
      { value: ["chocolate", "sienna", "peru"], isAvailable: false, tooltip: "Brown Spectrum" },
      { value: "orange", isAvailable: true, tooltip: "Solid Orange" },
      { value: ["orange", "red"], isAvailable: true, tooltip: "Warm Duo" },
      { value: "yellow", isAvailable: false, tooltip: "Solid Yellow" },
      { value: ["blue", "cyan", "teal"], isAvailable: true, tooltip: "Ocean Tones" },
      { value: "magenta", isAvailable: true, tooltip: "Solid Magenta" },
      { value: ["pink", "coral"], isAvailable: false, tooltip: "Pink & Coral" },
      { value: "navy", isAvailable: true, tooltip: "Solid Navy" },
      { value: ["gray", "silver", "white"], isAvailable: true, tooltip: "Silver Spectrum" },
      { value: "lime", isAvailable: false, tooltip: "Solid Lime" },
      { value: ["crimson", "maroon"], isAvailable: true, tooltip: "Deep Reds" },
      { value: "coral", isAvailable: true, tooltip: "Solid Coral" },
      { value: ["yellow", "gold", "orange", "red"], isAvailable: false, tooltip: "Fire Spectrum" },
      { value: "peru", isAvailable: true, tooltip: "Solid Peru" },
      { value: ["lavender", "purple"], isAvailable: true, tooltip: "Lavender & Purple" },
      { value: "sienna", isAvailable: false, tooltip: "Solid Sienna" },
      { value: ["teal", "turquoise", "cyan", "aqua"], isAvailable: true, tooltip: "Aquatic Colors" },
      { value: "tan", isAvailable: true, tooltip: "Solid Tan" },
      { value: ["red", "pink"], isAvailable: false, tooltip: "Red & Pink" },
      { value: "wheat", isAvailable: true, tooltip: "Solid Wheat" },
      { value: ["blue", "indigo", "violet"], isAvailable: true, tooltip: "Blue-Violet Mix" },
      { value: "orchid", isAvailable: false, tooltip: "Solid Orchid" },
      { value: ["green", "lime", "yellow"], isAvailable: true, tooltip: "Spring Colors" },
      { value: "tomato", isAvailable: true, tooltip: "Solid Tomato" },
      { value: ["brown", "chocolate", "sienna", "peru"], isAvailable: false, tooltip: "Chocolate Spectrum" },
      { value: "#E91E63", isAvailable: true, tooltip: "Custom Pink" },
      { value: ["#9C27B0", "#673AB7"], isAvailable: false, tooltip: "Custom Purple Duo" },
      { value: "#00BCD4", isAvailable: true, tooltip: "Custom Cyan" },
      { value: ["#FF5722", "#FF9800", "#FFC107"], isAvailable: true, tooltip: "Custom Orange Mix" },
      { value: "#8BC34A", isAvailable: false, tooltip: "Custom Light Green" },
      { value: ["#3F51B5", "#2196F3", "#03A9F4", "#00BCD4"], isAvailable: true, tooltip: "Custom Blue Gradient" },
    ];
    return { args, model, items };
  },
  template: `<VcVariantPickerGroup v-model="model" v-bind="args">
    <VcVariantPicker v-for="(item, index) in items" :key="index" :value="item.value" :is-available="item.isAvailable" :tooltip="item.tooltip" />
  </VcVariantPickerGroup>`,
});

export const MultiColorShowMore = TemplateMultiColorShowMore.bind({});
MultiColorShowMore.args = {
  type: "color",
  multiple: false,
  truncate: true,
  modelValue: "",
};

const TemplateMultiColorSizes: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const modelXXS = ref<string | string[]>("");
    const modelXS = ref<string | string[]>("");
    const modelSM = ref<string | string[]>("");
    const modelMD = ref<string | string[]>("");
    const modelLG = ref<string | string[]>("");
    const items = [
      { value: ["red", "blue"], isAvailable: true, tooltip: "Red & Blue" },
      { value: ["green", "yellow"], isAvailable: true, tooltip: "Green & Yellow" },
      { value: ["orange", "purple"], isAvailable: false, tooltip: "Orange & Purple" },
      { value: ["pink", "cyan"], isAvailable: true, tooltip: "Pink & Cyan" },
      { value: ["red", "green", "blue"], isAvailable: true, tooltip: "RGB" },
      { value: ["yellow", "magenta", "cyan"], isAvailable: false, tooltip: "CMY" },
      { value: ["brown", "beige", "tan"], isAvailable: true, tooltip: "Earth Tones" },
      { value: ["purple", "pink", "magenta", "violet"], isAvailable: false, tooltip: "Purple Mix" },
      { value: ["red", "orange", "yellow", "green"], isAvailable: true, tooltip: "Rainbow" },
      { value: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"], isAvailable: true, tooltip: "Custom Mix" },
    ];
    const sizes = [
      { name: "XXS", model: modelXXS, size: "xxs" },
      { name: "XS", model: modelXS, size: "xs" },
      { name: "SM", model: modelSM, size: "sm" },
      { name: "MD (default)", model: modelMD, size: "md" },
      { name: "LG", model: modelLG, size: "lg" },
    ];
    return { args, modelXXS, modelXS, modelSM, modelMD, modelLG, items, sizes };
  },
  template: `
    <div class="space-y-6">
      <div v-for="sizeGroup in sizes" :key="sizeGroup.name">
        <h3 class="mb-2 text-sm font-bold">Size: {{ sizeGroup.name }}</h3>
        <VcVariantPickerGroup v-model="sizeGroup.model" v-bind="args">
          <VcVariantPicker
            v-for="(item, index) in items"
            :key="index"
            :size="sizeGroup.size"
            :value="item.value"
            :is-available="item.isAvailable"
            :tooltip="item.tooltip"
          />
        </VcVariantPickerGroup>
      </div>
    </div>
  `,
});

export const MultiColorSizes = TemplateMultiColorSizes.bind({});
MultiColorSizes.args = {
  type: "color",
  multiple: false,
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

        <VcVariantPickerGroup v-model="model" v-bind="args">
          <VcVariantPicker
            v-for="(option, index) in options"
            :key="index"
            :value="option.value"
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
  type: "color",
  multiple: true,
  modelValue: [["red", "blue"], "green"],
};

export const MultiColorSingleSelect = TemplateMultiColorMultiSelect.bind({});
MultiColorSingleSelect.args = {
  type: "color",
  multiple: false,
  size: "sm",
  modelValue: ["red", "blue"],
};
