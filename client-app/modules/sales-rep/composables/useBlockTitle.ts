import { toValue } from "vue";
import { useI18n } from "vue-i18n";
import { getBlock } from "../layout/registry";
import type { SalesRepLayoutScopeType } from "../types/layout";
import type { MaybeRefOrGetter } from "vue";

/**
 * The localized name of a block, shared by everything that names one to a person: the control labels,
 * the hidden tray and the `aria-live` announcements. Falls back to the raw id — a saved document can
 * still name a block a later release dropped from the registry.
 */
export function useBlockTitle(scope: MaybeRefOrGetter<SalesRepLayoutScopeType>) {
  const { t } = useI18n();

  const titleOf = (id: string): string => {
    const block = getBlock(toValue(scope), id);
    return block ? t(block.titleKey) : id;
  };

  return { titleOf };
}
