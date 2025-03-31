import type { PageBuilderComponentDescriptorType } from "./models/PageBuilderComponentType";
import ImageBlock from "@/shared/static-content/components/image-block.vue";
import Login from "@/shared/static-content/components/login.vue";
import TextBlock from "@/shared/static-content/components/text-block.vue";

export const PageBuilderComponents: PageBuilderComponentDescriptorType[] = [
  // you can write just name of the component if it is described in file with same name as component
  "slider",
  // you can write just name of the component if it is described in file with same name as component
  Login,
  // you can add filename if its properties are described in the other file
  [TextBlock, "text"],
  // you can add component with properties
  {
    name: "Image",
    component: ImageBlock,
    icon: "image",
    displayField: "name",
    settings: [
      {
        id: "image",
        type: "images",
        multiple: false,
        tab: "Content",
      },
      {
        id: "alttext",
        label: "Alternative Text",
        type: "string",
        tab: "Content",
      },
    ],
  },
];
