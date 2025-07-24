import type { OrderStatusCodeType } from "../enums/order-status.enum.js";

export interface IOrderStatus {
  code: OrderStatusCodeType;
  color: VcChipColorType;
  variant: VcChipVariantType;
  icon?: string;
}
