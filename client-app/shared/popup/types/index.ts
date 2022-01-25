import { Component } from "vue";

export interface IPopup {
  component: Component;
  props?: Record<string, unknown>;
}
