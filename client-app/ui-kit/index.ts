import { vOnClickOutside } from "@vueuse/components";
import { vMaska } from "maska/vue";
import VueSecureHTML from "vue-html-secure";
import * as UIKitComponents from "@/ui-kit/components";
import type { MaskaDetail } from "maska";
import type { App, DirectiveBinding, Plugin, VNode } from "vue";

type VMaskaType = (
  el: HTMLElement,
  binding: DirectiveBinding<MaskaDetail | undefined>,
  vnode: VNode,
  prevVnode: VNode,
) => void;

export const uiKit: Plugin = {
  install: (app: App) => {
    // Directives
    const vMask: VMaskaType = (element, binding, vnode, prevVNode) => {
      console.warn(
        "[UIKit][warn] v-mask is deprecated, use v-maska directly instead: https://beholdr.github.io/maska/",
      );
      (vMaska as VMaskaType)(element, binding, vnode, prevVNode);
    };
    app.directive("mask", vMask);
    app.directive("onClickOutside", vOnClickOutside);

    // Components
    // Register UI Kit components globally
    Object.entries(UIKitComponents).forEach(([name, component]) => app.component(name, component));

    app.use(VueSecureHTML as Plugin);
  },
};
