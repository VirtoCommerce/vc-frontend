import { defineComponent, h, toRef } from "vue";
import { RouterLink } from "vue-router";
import { useLanguages } from "@/core/composables/useLanguages";
import type { Slots } from "vue";
import type { ComponentProps } from "vue-component-type-helpers";
import type { RouteLocationAsRelativeGeneric } from "vue-router";

type RouterLinkPropsType = ComponentProps<typeof RouterLink>;

export const RouterLinkWrapper = defineComponent({
  // @ts-expect-error not typed properly https://router.vuejs.org/guide/advanced/extending-router-link
  props: RouterLink.props as RouterLinkPropsType,

  setup(props: RouterLinkPropsType, { slots }: { slots: Slots }) {
    const { defaultLocale, pinnedLocale } = useLanguages();
    const language = pinnedLocale.value === defaultLocale.value ? "" : pinnedLocale.value;

    const to = toRef(props, "to");

    const newTo =
      typeof to.value === "string"
        ? { path: to.value, params: { locale: language } }
        : { ...to.value, params: { ...(to.value as RouteLocationAsRelativeGeneric).params, locale: language } };

    return () =>
      h(
        RouterLink,
        {
          ...props,
          to: newTo,
        },
        slots,
      );
  },
});
