import type { FlipOptions, OffsetOptions, Placement, ShiftOptions, Strategy } from "@floating-ui/vue";

declare global {
  type VcPopoverPlacementType = Placement;
  type VcPopoverStrategyType = Strategy;
  type VcPopoverFlipOptionsType = FlipOptions;
  type VcPopoverOffsetOptionsType = OffsetOptions;
  type VcPopoverShiftOptionsType = ShiftOptions;
}
