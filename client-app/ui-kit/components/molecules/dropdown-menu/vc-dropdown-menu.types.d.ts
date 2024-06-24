import type { VcPopoverPlacementType, VcPopoverOffsetOptionsType } from "../../atoms/popover/vc-popover.types.d";

declare global {
  type VcDropdownMenuPlacementType = VcPopoverPlacementType;
  type VcDropdownMenuOffsetOptionsType = VcPopoverOffsetOptionsType;
}
