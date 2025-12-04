import { VcFileUploader } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const VIEW_OPTIONS = ["horizontal", "vertical"];

const meta: Meta<typeof VcFileUploader> = {
  title: "Components/Molecules/VcFileUploader",
  component: VcFileUploader,
  argTypes: {
    view: {
      control: "inline-radio",
      options: VIEW_OPTIONS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: VIEW_OPTIONS.join(" | "),
        },
      },
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcFileUploader v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    maxFileCount: 5,
    maxFileSize: 5,
    allowedExtensions: [".zip", ".csv", ".pdf"],
    files: [
      {
        name: "Archive.zip",
        size: 5 * 1024 * 1024,
        contentType: "application/zip",
        status: "attached",
        url: "Fake.pdf",
      },
      {
        name: "Document.pdf",
        size: 1 * 1024,
        contentType: "application/pdf",
        progress: 100,
        status: "uploaded",
        file: new File([], "Document.pdf"),
        id: "UUID",
        url: "Fake.pdf",
      },
      {
        name: "Data.csv",
        size: 256,
        contentType: "application/csv",
        progress: 45,
        status: "uploading",
        file: new File([], "Document.pdf"),
      },
      {
        name: "App.exe",
        size: 578 * 1024,
        contentType: "application/octet-stream",
        status: "error",
        errorMessage: "File is not in one of allowed formats .zip, .csv, .pdf.",
      },
      {
        name: "Program.bin",
        size: 11 * 1024 * 1024,
        contentType: "application/octet-stream",
        status: "error",
        errorMessage: "File size exceeds the allowed 10MB.",
      },
    ],
  },
};
