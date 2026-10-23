import { useClipboard } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { useNotifications } from "@/shared/notification";

const COPY_NOTIFICATION_DURATION = 4000;

export function useCouponCopy() {
  const { t } = useI18n();
  const { copy, isSupported } = useClipboard();
  const notifications = useNotifications();

  async function copyCoupon(text?: string): Promise<void> {
    if (isSupported.value && text?.trim()) {
      await copy(text);
      notifications.success({
        text: t("shared.account.promotion_coupons.clipboard_success"),
        duration: COPY_NOTIFICATION_DURATION,
        single: true,
      });
    }
  }

  return { copyCoupon };
}
