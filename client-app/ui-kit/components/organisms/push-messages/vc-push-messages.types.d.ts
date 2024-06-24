import type { VcPopoverPlacementType, VcPopoverOffsetOptionsType } from "../../atoms/popover/vc-popover.types.d";

declare global {
  type VcPushMessagesPlacementType = VcPopoverPlacementType;
  type VcPushMessagesOffsetOptionsType = VcPopoverOffsetOptionsType;
}
