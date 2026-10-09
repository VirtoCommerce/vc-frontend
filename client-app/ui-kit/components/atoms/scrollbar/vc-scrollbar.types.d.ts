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
  };
}

export {};
