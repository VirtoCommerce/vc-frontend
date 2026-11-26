import {
  EMPTY_VIEW_ENTITIES,
  EMPTY_VIEW_GENERIC,
  EMPTY_VIEW_LEGACY_ICONS,
  EMPTY_VIEW_LEGACY_VARIANTS,
  EMPTY_VIEW_REASONS,
} from "@/ui-kit/constants";

export interface IEmptyViewMedia {
  reason: VcEmptyViewReasonType;
  tone: VcEmptyViewToneType;
  glyph: string;
  icon: VcEmptyIconNameType;
}

/**
 * Resolves what an empty view shows: reason (explicit → legacy variant), entity (explicit → legacy icon name),
 * then tone, glyph and drawn icon. An unknown legacy icon name stays as the glyph.
 */
export function resolveEmptyViewMedia(options: {
  reason?: VcEmptyViewReasonType;
  entity?: VcEmptyViewEntityType;
  variant?: VcEmptyViewVariantType;
  icon?: string;
}): IEmptyViewMedia {
  const reason =
    (options.reason && options.reason in EMPTY_VIEW_REASONS ? options.reason : undefined) ??
    (options.variant ? EMPTY_VIEW_LEGACY_VARIANTS[options.variant] : undefined) ??
    "no-data";
  const config = EMPTY_VIEW_REASONS[reason];
  const legacyEntity = options.icon ? EMPTY_VIEW_LEGACY_ICONS[options.icon] : undefined;
  const entityName = options.entity && options.entity in EMPTY_VIEW_ENTITIES ? options.entity : legacyEntity;
  const entity = entityName ? EMPTY_VIEW_ENTITIES[entityName] : undefined;

  if (!config.showsEntity) {
    return { reason, tone: config.tone, glyph: config.glyph, icon: config.icon ?? EMPTY_VIEW_GENERIC.icon };
  }

  const fallbackGlyph = reason === "no-data" ? EMPTY_VIEW_GENERIC.glyph : config.glyph;

  return {
    reason,
    tone: config.tone,
    glyph: entity?.glyph ?? (options.icon && !entityName ? options.icon : fallbackGlyph),
    icon: entity?.icon ?? config.icon ?? EMPTY_VIEW_GENERIC.icon,
  };
}
