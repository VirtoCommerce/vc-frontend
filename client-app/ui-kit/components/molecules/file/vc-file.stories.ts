import { VcFile } from "..";
import type { Meta, StoryFn } from "@storybook/vue3-vite";

export default {
  title: "Components/Molecules/VcFile",
  component: VcFile,
} as Meta<typeof VcFile>;

const Template: StoryFn = (args) => ({
  components: { VcFile },
  setup: () => ({ args }),
  template: '<VcFile v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  file: {
    name: "Image.png",
    size: 111122233,
    contentType: "image/png",
    status: "new",
    file: new File([], "Image.png"),
  },
};

export const Uploading = Template.bind({});
Uploading.args = {
  file: {
    name: "FileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImage.png",
    size: 11122233,
    contentType: "application/pdf",
    progress: 45,
    status: "uploading",
    file: new File(
      [],
      "FileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImage.png",
    ),
  },
};

export const Uploaded = Template.bind({});
Uploaded.args = {
  file: {
    name: "Image.png",
    size: 111122233,
    contentType: "image/png",
    status: "uploaded",
    progress: 100,
    url: "https://via.placeholder.com/150",
  },
};

export const Failed = Template.bind({});
Failed.args = {
  file: {
    name: "Archive.zip",
    size: 16155533,
    contentType: "application/zip",
    status: "error",
    errorMessage:
      "Error message long long long long long error message stringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstring",
    file: new File([], "Archive.zip"),
  },
};

export const Attached = Template.bind({});
Attached.args = {
  file: {
    name: "Image.png",
    size: 111122233,
    contentType: "image/png",
    status: "attached",
    url: "https://via.placeholder.com/150",
  },
};

export const Removable = Template.bind({});
Removable.args = {
  file: {
    name: "FileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImage.png",
    size: 111122233,
    contentType: "image/png",
    status: "new",
    file: new File(
      [],
      "FileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImage.png",
    ),
  },
  removable: true,
};

export const RemovableReloadable = Template.bind({});
RemovableReloadable.args = {
  file: {
    name: "FileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImage.png",
    size: 111122233,
    contentType: "image/png",
    status: "new",
    file: new File(
      [],
      "FileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImage.png",
    ),
  },
  removable: true,
  reloadable: true,
};
