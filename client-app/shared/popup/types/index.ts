import { Component } from "vue";

export type ClosePopupHandle = () => void;

export interface IPopup {
  id?: string;
  component: Component;
  props?: Record<string, unknown>;
}
