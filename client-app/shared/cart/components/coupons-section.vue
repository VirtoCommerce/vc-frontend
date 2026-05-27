<template>
  <VcWidget class="coupons-section" :title="$t('shared.cart.coupons_section.title')">
    <template #default-container>
      <div class="coupons-section__container">
        <CouponCard
          v-for="coupon in coupons"
          :key="coupon.id"
          :coupon="coupon"
          :view="getView(coupon.couponCode)"
          :error="getError(coupon.couponCode)"
          :loading="!!coupon.couponCode && coupon.couponCode === loadingCouponCode"
          @apply="applyCoupon"
          @remove="removeCoupon"
        />

        <CouponCard
          v-model="customCode"
          custom
          :view="getView(customCode)"
          :error="getError(customCode)"
          :loading="!!customCode && customCode === loadingCouponCode"
          @apply="applyCoupon"
          @remove="removeCoupon"
        />
      </div>

      <router-link
        v-if="queryEnabled"
        class="coupons-section__link"
        :to="{ name: ROUTES.PROMOTION_COUPONS.NAME }"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ $t("shared.cart.coupons_section.all_coupons") }}
        <VcIcon class="coupons-section__arrow" name="arrow-right" :size="14" />
      </router-link>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useModules } from "@/core/composables";
import { MODULE_ID_MARKETING_EXPERIENCE_API } from "@/core/constants/modules";
import { ROUTES } from "@/router/routes/constants";
import { usePromotionCoupons, useUser } from "@/shared/account";
import { useCoupon } from "@/shared/cart";
import CouponCard from "./coupon-card.vue";

const COUPONS_PER_PAGE = 4;

const { hasModule } = useModules();
const { t } = useI18n();
const { isAuthenticated } = useUser();
const isMarketingExperienceApiEnabled = computed(() => hasModule(MODULE_ID_MARKETING_EXPERIENCE_API));
const queryEnabled = computed(() => isAuthenticated.value && isMarketingExperienceApiEnabled.value);
const { coupons } = usePromotionCoupons(COUPONS_PER_PAGE, undefined, queryEnabled);
const { appliedCouponCode, couponError, loadingCouponCode, applyCoupon, removeCoupon } = useCoupon();

const customCode = ref("");

watchEffect(() => {
  const applied = appliedCouponCode.value;
  if (!applied) {
    return;
  }

  const isInList = coupons.value.some((coupon) => coupon.couponCode === applied);

  if (!isInList && customCode.value !== applied) {
    customCode.value = applied;
  } else if (isInList && customCode.value === applied) {
    customCode.value = "";
  }
});

function getView(code: string | undefined): "default" | "applied" | "error" {
  if (!code) {
    return "default";
  }
  if (code === appliedCouponCode.value) {
    return "applied";
  }
  if (code === couponError.value?.code) {
    return "error";
  }
  return "default";
}

function getError(code: string | undefined): string | undefined {
  if (!code || code !== couponError.value?.code) {
    return undefined;
  }
  return couponError.value.type === "failed" ? t("common.messages.failed_coupon") : t("common.messages.invalid_coupon");
}
</script>

<style lang="scss">
.coupons-section {
  &__container {
    @apply space-y-3 px-5 py-4;
  }

  &__link {
    @apply pb-4 px-5 flex text-xs font-bold gap-2 text-[--link-color] hover:text-[--link-hover-color];
  }

  &__arrow {
    @apply text-primary-500;
  }
}
</style>
