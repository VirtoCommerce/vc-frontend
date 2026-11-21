import type { Component, ObjectDirective } from "vue";

/** A checked attribute value: a `number` field gives a number, a `boolean` one a boolean. */
export type CustomSectionValueType = string | number | boolean;

/** The directive a behavior's attribute switches on; its value is the attribute's, bindings resolved. */
export type CustomSectionDirectiveType = ObjectDirective<HTMLElement, string | undefined>;

/**
 * An attribute of a kit tag, or the value or an option of a behavior, as the agent that writes templates and the
 * server that checks them read it. The storefront drops a tag attribute that breaks it.
 */
export interface ICustomSectionField {
  /** `link`: a path on the site, or an `https:`, `mailto:` or `tel:` URL. `date`: an ISO 8601 date or date-time. */
  type: "string" | "number" | "boolean" | "select" | "link" | "date";
  /** The values a `select` takes. */
  options?: string[];
  /** A `select` of the storefront's icon names, which the catalog lists once, as `kit.icons`. */
  optionsFrom?: "icons";
  min?: number;
  max?: number;
  description?: string;
}

/** A storefront component a custom section template places as a `vc-*` tag. A kit tag has no content. */
export interface ICustomSectionTag {
  /** Load it lazily with `defineAsyncComponent`, unless the host loads it anyway. */
  component: Component;
  /** What the tag shows, for the agent that writes templates. */
  description: string;
  /** By attribute name; any other attribute is left out. */
  attributes: Record<string, ICustomSectionField>;
  /** The checked attributes as the component's props; without it each goes as the prop of its camelCase name. */
  mapProps?: (attributes: Record<string, CustomSectionValueType>) => Record<string, unknown>;
  /** The attribute whose text fills the component's default slot, such as a button's `label`. */
  slotAttribute?: string;
  condition?: never;
  props?: never;
}

/** A behavior a custom section template switches on with the attribute `data-{name}`. */
export interface ICustomSectionBehavior {
  /** Loads the directive, the first time a template uses the behavior. */
  directive: () => Promise<CustomSectionDirectiveType>;
  /** What the behavior does, for the agent that writes templates. */
  description: string;
  /** What `data-{name}` holds; none for a switch. */
  value?: ICustomSectionField;
  /** By option name: the attribute `data-{name}-{option}`. */
  options?: Record<string, ICustomSectionField>;
  /** What the directive writes for the section's CSS: a `--variable`, a `data-` attribute, or `text`. */
  writes?: string[];
  /** Attributes of the elements whose text the directive writes: the template's text in them is not rendered. */
  textAttributes?: string[];
  /** The renderer repeats the element's children once, the copies marked `data-sb-repeat` and hidden from assistive technology. */
  repeatsChildren?: boolean;
  component?: never;
  condition?: never;
  props?: never;
}
