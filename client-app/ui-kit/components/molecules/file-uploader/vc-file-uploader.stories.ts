import { VcFileUploader } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcFileUploader",
  component: VcFileUploader,
  argTypes: {
    view: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      type: { name: "string", required: false },
      table: {
        type: {
          summary: ["horizontal", "vertical"],
        },
      },
    },
  },
} as Meta<typeof VcFileUploader>;

const Template: StoryFn<typeof VcFileUploader> = (args) => ({
  components: { VcFileUploader },
  setup: () => ({ args }),
  template: '<VcFileUploader v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  maxFileCount: 5,
  maxFileSize: 5,
  allowedExtensions: [".zip", ".csv", ".pdf"],
  files: [
    {
      name: "Archive.zip",
      size: 5 * 1024 * 1024,
      contentType: "application/zip",
      status: "existing",
      url: "Fake.pdf",
    },
    {
      name: "Document.pdf",
      size: 1 * 1024,
      contentType: "application/pdf",
      progress: 100,
      status: "success",
      id: "UUID",
      url: "Fake.pdf",
    },
    {
      name: "Data.csv",
      size: 256,
      contentType: "application/csv",
      progress: 45,
      status: "loading",
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
};
