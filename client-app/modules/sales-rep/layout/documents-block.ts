import { defineAsyncComponent, markRaw } from "vue";
import { DOCUMENTS_BLOCK_ID, DOCUMENTS_DEFAULT_ROWS, DOCUMENTS_MAX_ROWS, MIN_ROWS } from "../constants";
import type { SalesRepBlockType } from "../types/layout";

// `markRaw` keeps Vue from making the component definition reactive when it lands in layout state.
const SalesRepDocuments = markRaw(defineAsyncComponent(() => import("../components/sales-rep-documents.vue")));

// Document library widget (VCST-5730). Defined here rather than in registry.ts defaults because it
// exists only for reps carrying sales-rep-documents:read — init (index.ts) registers it through the
// `registerBlock` seam behind that permission check, which also keeps it out of the layout editor
// and the hidden tray for everyone else.
export const documentsBlock: SalesRepBlockType = {
  id: DOCUMENTS_BLOCK_ID,
  // The design mock places the library as a right-column card, next to the orders/top-sellers column.
  region: "mainRight",
  titleKey: "sales_rep.documents.title",
  order: 10,
  component: SalesRepDocuments,
  settings: [{ kind: "maxRows", default: DOCUMENTS_DEFAULT_ROWS, min: MIN_ROWS, max: DOCUMENTS_MAX_ROWS }],
};
