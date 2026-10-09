import { defineAsyncComponent, markRaw } from "vue";
import { MIN_ROWS } from "@/shared/dashboard";
import { DOCUMENTS_BLOCK_ID, DOCUMENTS_DEFAULT_ROWS, DOCUMENTS_MAX_ROWS } from "../constants";
import type { BlockType } from "@/shared/dashboard";

const SalesRepDocuments = markRaw(defineAsyncComponent(() => import("../components/sales-rep-documents.vue")));

// Registered (via registerBlock in index.ts) only for reps carrying sales-rep-documents:read.
export const documentsBlock: BlockType = {
  id: DOCUMENTS_BLOCK_ID,
  region: "mainRight",
  titleKey: "sales_rep.documents.title",
  order: 10,
  component: SalesRepDocuments,
  settings: [{ kind: "maxRows", default: DOCUMENTS_DEFAULT_ROWS, min: MIN_ROWS, max: DOCUMENTS_MAX_ROWS }],
};
