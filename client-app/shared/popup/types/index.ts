import type { Component } from "vue";

export type ClosePopupHandle = () => void;

export interface IPopup {
  id?: string;
  component: Component | "VcConfirmationModal";
  // FIXME: https://virtocommerce.atlassian.net/browse/ST-5119
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
}
