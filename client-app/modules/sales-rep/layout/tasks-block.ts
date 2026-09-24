import { defineAsyncComponent, markRaw } from "vue";
import { MIN_ROWS, TASKS_BLOCK_ID, TASKS_DEFAULT_ROWS, TASKS_MAX_ROWS } from "../constants";
import type { SalesRepBlockType } from "../types/layout";

const SalesRepTasks = markRaw(defineAsyncComponent(() => import("../components/sales-rep-tasks.vue")));

// Registered (via registerBlock in index.ts) only when vc-module-task-management is installed.
export const tasksBlock: SalesRepBlockType = {
  id: TASKS_BLOCK_ID,
  region: "mainRight",
  titleKey: "sales_rep.tasks.widget_title",
  order: 5,
  component: SalesRepTasks,
  settings: [{ kind: "maxRows", default: TASKS_DEFAULT_ROWS, min: MIN_ROWS, max: TASKS_MAX_ROWS }],
};
