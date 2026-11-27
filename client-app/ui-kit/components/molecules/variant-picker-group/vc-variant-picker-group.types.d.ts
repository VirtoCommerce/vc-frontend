import type { Ref } from "vue";

declare global {
  type VcVariantPickerGroupContextType = {
    modelValue: Ref<string | string[]>;
    multiple: Ref<boolean>;
    size: Ref<VcVariantPickerSizeType | undefined>;
    type: Ref<VcVariantPickerType | undefined>;
    name: Ref<string | undefined>;
    toggleValue: (value: string | string[]) => void;
    /**
     * How text tiles and cards take the group's width: `stretch` fills a `columns` cell, `share` shares the row
     * (`fullWidth`). Without it they keep their content's width.
     */
    width?: Ref<"content" | "stretch" | "share">;
    /** Bound on every picker's trigger, not on the group's root: a `multiple` group's root is `role="group"`. */
    onKeydown?: (event: KeyboardEvent) => void;
    /**
     * A single-choice group's one Tab stop: its pickers' triggers get `tabindex="0"` when they are this element and
     * `-1` otherwise, whatever their `tabindex` prop. A `multiple` group does not use it.
     */
    tabStop?: Readonly<Ref<HTMLElement | null>>;
  };

  type VcVariantPickerGroupColumnsType = 1 | 2 | 3 | 4;
}
