import type { Component, ObjectDirective } from "vue";

/** A checked attribute value: a `number` field gives a number, a `boolean` one a boolean. */
export type CustomSectionValueType = string | number | boolean;

/**
 * The directive a behavior's attribute switches on; its value is the attribute's, bindings resolved. It loads
 * lazily, after its element may already be in the page, so it has the hooks from `mounted` on. The element mounts
 * afresh when the value, an option or the visitor's motion preference changes, so `mounted` reads them all.
 * `defineBehavior` builds one whose hooks run in the element's own scope; a hook written by hand runs in none, and
 * `unmounted` must stop what it started.
 */
export type CustomSectionDirectiveType = Pick<
  ObjectDirective<HTMLElement, string | undefined>,
  "mounted" | "beforeUpdate" | "updated" | "beforeUnmount" | "unmounted"
>;

/** The types of field the server reads in a kit. */
export const CUSTOM_SECTION_FIELD_TYPES = ["string", "number", "boolean", "select", "link", "date"] as const;

/**
 * An attribute of a kit tag, or the value or an option of a behavior, as the agent that writes templates and the
 * server that checks them read it. The storefront drops a tag attribute that breaks it.
 */
export interface ICustomSectionField {
  /**
   * `link`: a path on the site, an anchor of the page, or an `https:`, `mailto:` or `tel:` URL. `date`: an ISO 8601
   * date or date-time; a date alone means 00:00 UTC of that day, the same moment for every visitor, and a date-time
   * names another moment with its offset.
   */
  type: (typeof CUSTOM_SECTION_FIELD_TYPES)[number];
  /** The values a `select` takes; a select has these or `optionsFrom`. */
  options?: string[];
  /** A `select` of the storefront's icon names, which the catalog lists once, as `kit.icons`. */
  optionsFrom?: "icons";
  min?: number;
  max?: number;
  description?: string;
}

/** A storefront component a custom section template places as a `vc-*` tag. A kit tag has no content. */
export interface ICustomSectionTag {
  /**
   * Load it lazily with `defineAsyncComponent`, unless the host loads it anyway. It renders one root element that
   * takes the attributes passed through: a repeated copy hides itself from assistive technology through them.
   */
  component: Component;
  /** What the tag shows, for the agent that writes templates. */
  description: string;
  /** By attribute name; any other attribute is left out. */
  attributes: Record<string, ICustomSectionField>;
  /** The checked attributes as the component's props; without it each goes as the prop of its camelCase name. */
  mapProps?: (attributes: Record<string, CustomSectionValueType>) => Record<string, unknown>;
  /** The attribute whose text fills the component's default slot, such as a button's `label`. */
  slotAttribute?: string;
  /**
   * The most elements one instance renders, a whole number from 1 to the render budget; 1 when left out. The
   * section's render budget counts it for every instance, list rows included.
   */
  cost?: number;
  /**
   * An instance does work beyond drawing, such as a request or an analytics view, which a copy would do again: the
   * tag is left out of an element whose behavior repeats its children.
   */
  hasSideEffects?: boolean;
}

/**
 * A behavior a custom section template switches on with the attribute `data-{name}`. Under
 * `prefers-reduced-motion: reduce` it shows its end state at once.
 */
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
  /**
   * Attributes of the elements whose text the directive writes, each `data-{name}` or `data-{name}-…`: the
   * template's text in them is not rendered.
   */
  textAttributes?: string[];
  /** The renderer repeats the element's children once, the copies marked `data-sb-repeat` and hidden from assistive technology. */
  repeatsChildren?: boolean;
}
