import { VcFile } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcFile> = {
  title: "Components/Molecules/VcFile",
  component: VcFile,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcFile v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    file: {
      name: "Image.png",
      size: 111122233,
      contentType: "image/png",
      status: "new",
      file: new File([], "Image.png"),
      progress: 0,
    },
  },
};

export const Uploading: StoryType = {
  args: {
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
  },
};

export const Uploaded: StoryType = {
  args: {
    file: {
      name: "Image.png",
      size: 111122233,
      contentType: "image/png",
      status: "uploaded",
      progress: 100,
      url: "https://via.placeholder.com/150",
      id: "uploaded-file-id",
      file: new File([], "Image.png"),
    },
  },
};

export const Failed: StoryType = {
  args: {
    file: {
      name: "Archive.zip",
      size: 16155533,
      contentType: "application/zip",
      status: "error",
      errorMessage:
        "Error message long long long long long error message stringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstring",
      file: new File([], "Archive.zip"),
    },
  },
};

export const Attached: StoryType = {
  args: {
    file: {
      name: "Image.png",
      size: 111122233,
      contentType: "image/png",
      status: "attached",
      url: "https://via.placeholder.com/150",
    },
  },
};

export const Removable: StoryType = {
  args: {
    file: {
      name: "FileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImage.png",
      size: 111122233,
      contentType: "image/png",
      status: "new",
      file: new File(
        [],
        "FileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImage.png",
      ),
      progress: 0,
    },
    removable: true,
  },
};

export const RemovableReloadable: StoryType = {
  args: {
    file: {
      name: "FileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImage.png",
      size: 111122233,
      contentType: "image/png",
      status: "new",
      file: new File(
        [],
        "FileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImageFileWithVeryLongNameImage.png",
      ),
      progress: 0,
    },
    removable: true,
    reloadable: true,
  },
};
