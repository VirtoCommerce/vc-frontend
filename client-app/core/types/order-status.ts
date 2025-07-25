import type { OrderStatusCodeType } from "../constants/order-status.js";

export interface IOrderStatus {
  code: OrderStatusCodeType;
  color: VcChipColorType;
  variant: VcChipVariantType;
  icon?: string;
}
