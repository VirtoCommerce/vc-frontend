import type { Component } from "vue";

export type CloseModalHandleType = () => void;

export interface IModal {
  id?: string;
  component: Component | "VcConfirmationModal";
  // TODO: https://virtocommerce.atlassian.net/browse/ST-5119
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
}
