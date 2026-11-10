import { useI18n } from "vue-i18n";

// The badge is aria-hidden ("99+" is visual only), so the full count goes into the control's accessible name
export function useHeaderCountLabel() {
  const { t, n } = useI18n();

  // For icon-only controls: the title is their only name, so it is returned even without a count
  function getCountLabel(title: string | undefined, count?: number): string | undefined {
    return count && title ? t("shared.layout.header.link_with_count", { title, count: n(count) }) : title;
  }

  // For controls with visible text: no aria-label at all until there is a count to add to that text
  function getCountAriaLabel(title: string | undefined, count?: number): string | undefined {
    return count ? getCountLabel(title, count) : undefined;
  }

  return { getCountLabel, getCountAriaLabel };
}
