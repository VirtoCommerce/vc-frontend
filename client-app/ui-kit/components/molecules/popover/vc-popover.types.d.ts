import type { FlipOptions, OffsetOptions, Placement, ShiftOptions, Strategy } from "@floating-ui/vue";
import type { Ref } from "vue";

declare global {
  type VcPopoverPlacementType = Placement;
  type VcPopoverStrategyType = Strategy;
  type VcPopoverFlipOptionsType = FlipOptions;
  type VcPopoverOffsetOptionsType = OffsetOptions;
  type VcPopoverShiftOptionsType = ShiftOptions;

  /** Roles VcPopover understands; `dialog` also enables its non-modal dialog keyboard contract. */
  type VcPopoverRoleType = "dialog" | "menu" | "listbox" | "tree" | "grid" | "tooltip";

  type VcPopoverContextType = {
    enableTeleport: Ref<boolean>;
  };
}
