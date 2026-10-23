<template>
  <VcRecordCard class="coupon-record-card" :title="coupon.name" :description="coupon.description" :meta="meta">
    <template v-if="couponCode" #status>
      <VcChip
        color="warning"
        variant="outline"
        size="sm"
        icon="ticket"
        :title="$t('shared.account.promotion_coupons.tap_to_copy')"
        clickable
        rounded
        nowrap
        @click="copyCoupon(couponCode)"
      >
        {{ couponCode }}
      </VcChip>
    </template>
  </VcRecordCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCouponCopy } from "../composables/useCouponCopy";
import type { PromotionCouponType } from "@/core/api/graphql/types";

interface IProps {
  coupon: PromotionCouponType;
}

const props = defineProps<IProps>();

const { d } = useI18n();
const { copyCoupon } = useCouponCopy();

const couponCode = computed(() => props.coupon.couponCode?.toUpperCase());

const meta = computed<VcRecordCardMetaItemType[]>(() => {
  const items: VcRecordCardMetaItemType[] = [];

  if (props.coupon.label) {
    items.push({ icon: "tag", text: props.coupon.label });
  }

  if (props.coupon.endDate) {
    items.push({ icon: "calendar-clock", text: d(props.coupon.endDate, "short") });
  }

  return items;
});
</script>
