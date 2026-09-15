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
    /**
     * The edges the region is resting against, as of its last measurement — the same state the
     * `reach-*` events are derived from, so a descendant reading it can never disagree with the
     * consumer listening to them. An axis that cannot scroll is never measured and keeps its
     * initial value.
     */
    isAtTop: Readonly<import("vue").Ref<boolean>>;
    isAtBottom: Readonly<import("vue").Ref<boolean>>;
    isAtLeft: Readonly<import("vue").Ref<boolean>>;
    isAtRight: Readonly<import("vue").Ref<boolean>>;
    /**
     * Counts the measurements behind the edges above, so a descendant can tell a fresh reading
     * from one taken before the last content change.
     */
    measuredAt: Readonly<import("vue").Ref<number>>;
  };
}

export {};
