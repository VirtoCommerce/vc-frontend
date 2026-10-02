declare global {
  type VcScrollbarPayloadType = {
    scrollTop: number;
    scrollLeft: number;
    isAtTop: boolean;
    isAtBottom: boolean;
    isAtLeft: boolean;
    isAtRight: boolean;
  };

  type VcScrollbarInstanceType = {
    el: HTMLElement | null;
  };

  type VcScrollbarContextType = {
    el: import("vue").Ref<HTMLElement | null>;
    /** Edges the region rests against as of its last measurement; the source of the `reach-*` events. */
    isAtTop: Readonly<import("vue").Ref<boolean>>;
    isAtBottom: Readonly<import("vue").Ref<boolean>>;
    isAtLeft: Readonly<import("vue").Ref<boolean>>;
    isAtRight: Readonly<import("vue").Ref<boolean>>;
    /** Increments on every measurement, so a reader can tell a fresh reading from a stale one. */
    measuredAt: Readonly<import("vue").Ref<number>>;
  };
}

export {};
