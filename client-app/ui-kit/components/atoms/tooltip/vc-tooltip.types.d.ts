import type {
  VcPopoverPlacementType,
  VcPopoverStrategyType,
  VcPopoverFlipOptionsType,
  VcPopoverOffsetOptionsType,
  VcPopoverShiftOptionsType,
} from "../popover/vc-popover.types";
declare global {
  type VcTooltipPlacementType = VcPopoverPlacementType;
  type VcTooltipStrategyType = VcPopoverStrategyType;
  type VcTooltipFlipOptionsType = VcPopoverFlipOptionsType;
  type VcTooltipOffsetOptionsType = VcPopoverOffsetOptionsType;
  type VcTooltipShiftOptionsType = VcPopoverShiftOptionsType;
}
