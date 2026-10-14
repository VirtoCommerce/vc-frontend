declare global {
  type VcStatCardColorType = VcMainColorType;
  /** `positive` = up on the previous period, `negative` = down, `neutral` = unchanged or a plain count. */
  type VcStatCardToneType = "positive" | "negative" | "neutral";
}

export {};
