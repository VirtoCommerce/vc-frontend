import type { Component } from "vue";

export type ClosePopupHandle = () => void;

export interface IPopup {
  id?: string;
  component: Component | "VcConfirmationDialog";
  props?: Record<string, any>;
}
