<template>
  <div class="coupon-card" :class="[`coupon-card--${view}`]">
    <div class="coupon-card__icon">
      <VcIcon :name="viewConfig.iconName" :size="24" />
    </div>

    <div class="coupon-card__content">
      <h3 v-if="!custom && coupon?.label" class="coupon-card__label">{{ coupon.label }}</h3>

      <p v-if="custom" class="coupon-card__name">{{ $t("shared.cart.coupons_section.custom_code") }}</p>

      <p v-else-if="coupon?.name" class="coupon-card__name">{{ coupon.name }}</p>

      <VcInput
        v-model="code"
        size="xs"
        :readonly="!custom || view === 'applied' || loading"
        :placeholder="$t('shared.cart.coupons_section.enter_custom_code')"
      >
        <template #append>
          <VcButton v-bind="viewConfig.button" :loading="loading" @click="handleClick" />
        </template>
      </VcInput>

      <p v-if="!custom && coupon?.endDate && view !== 'error'" class="coupon-card__end-date">
        {{ $t("shared.cart.coupons_section.expires") }} {{ $d(coupon.endDate, "short") }}
      </p>

      <p v-if="view === 'error' && !!error" class="coupon-card__error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { GetPromotionCouponsQuery } from "@/core/api/graphql/types";

type ViewType = "default" | "applied" | "error";

interface IProps {
  coupon?: NonNullable<NonNullable<GetPromotionCouponsQuery["promotionCoupons"]>["items"]>[number];
  view: ViewType;
  error?: string;
  custom?: boolean;
  modelValue?: string;
  loading?: boolean;
}

interface IEmits {
  (event: "apply", code: string): void;
  (event: "remove", code: string): void;
  (event: "update:modelValue", value: string): void;
}

interface IViewConfig {
  iconName: string;
  button: {
    icon: string;
    variant: VcButtonVariantType;
    color: VcButtonColorType;
    disabled: boolean;
    ariaLabel: string;
  };
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), { custom: false, modelValue: "", loading: false });

const { t } = useI18n();

const code = computed({
  get: () => (props.custom ? props.modelValue : (props.coupon?.couponCode ?? "")),
  set: (value) => {
    if (props.custom) {
      emit("update:modelValue", value);
    }
  },
});

function handleClick() {
  const value = code.value.trim();
  if (!value) {
    return;
  }

  if (props.view === "default") {
    emit("apply", value);
  } else if (props.view === "applied") {
    emit("remove", value);
  }
}

const viewConfig = computed<IViewConfig>(() => {
  const applyAriaLabel = t("shared.cart.coupons_section.apply_aria", { code: code.value });
  const removeAriaLabel = t("shared.cart.coupons_section.remove_aria");

  const applyButtonBase = {
    icon: "arrow-right",
    variant: "solid",
    color: "primary",
    ariaLabel: applyAriaLabel,
  } as const;

  const viewConfigs: Record<ViewType, IViewConfig> = {
    default: {
      iconName: "receipt-tax",
      button: { ...applyButtonBase, disabled: false },
    },
    applied: {
      iconName: "round-check",
      button: {
        icon: "outline-trash",
        variant: "no-background",
        color: "neutral",
        disabled: false,
        ariaLabel: removeAriaLabel,
      },
    },
    error: {
      iconName: "receipt-tax",
      button: { ...applyButtonBase, disabled: true },
    },
  };

  return viewConfigs[props.view];
});
</script>

<style lang="scss">
.coupon-card {
  $default: "";
  $applied: "";
  $error: "";

  @apply border p-2.5 rounded flex gap-3;

  &--default {
    $default: &;

    @apply border-dashed border-secondary-400;
  }

  &--applied {
    $applied: &;

    @apply border-success-200 bg-gradient-to-r from-success-50 to-additional-50 to-40%;
  }

  &--error {
    $error: &;

    @apply border-dashed border-secondary-400;
  }

  &__content {
    @apply w-full;
  }

  &__icon {
    @apply size-12 min-w-12 rounded-full flex justify-center items-center;

    #{$default} & {
      @apply border border-secondary-400 text-secondary-400;
    }

    #{$applied} & {
      @apply bg-success-400 text-additional-50;
    }

    #{$error} & {
      @apply border border-danger-400 text-danger-400;
    }
  }

  &__label {
    @apply font-bold;
  }

  &__name {
    @apply text-xs font-bold mb-2;
  }

  &__end-date {
    @apply text-xs mt-1 text-neutral-600;
  }

  &__error {
    @apply text-xs mt-1 text-danger-500;
  }
}
</style>
