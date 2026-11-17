<template>
  <VcContainer class="how-it-works">
    <div class="how-it-works__content">
      <VcTypography tag="h1">{{ $t("product_subscriptions.how_it_works.title") }}</VcTypography>

      <p class="how-it-works__lead">{{ $t("product_subscriptions.how_it_works.lead") }}</p>

      <VcWidget :title="$t('product_subscriptions.how_it_works.steps.title')" prepend-icon="refresh-cw" size="lg">
        <ol class="how-it-works__steps">
          <li v-for="step in STEPS" :key="step.key" class="how-it-works__step">
            <VcShape
              class="how-it-works__step-icon"
              :icon="step.icon"
              mask="circle-solid"
              size="2.5rem"
              bg-color="--color-secondary-50"
              icon-color="--color-secondary-600"
            />

            <span class="how-it-works__step-text">
              <span class="how-it-works__step-title">
                {{ $t(`product_subscriptions.how_it_works.steps.${step.key}.title`) }}
              </span>

              <span>{{ $t(`product_subscriptions.how_it_works.steps.${step.key}.text`) }}</span>
            </span>
          </li>
        </ol>
      </VcWidget>

      <div class="how-it-works__rules">
        <VcWidget
          v-for="rule in RULES"
          :key="rule.key"
          :title="$t(`product_subscriptions.how_it_works.rules.${rule.key}.title`)"
          :prepend-icon="rule.icon"
        >
          <ul class="how-it-works__list">
            <li v-for="index in rule.items" :key="index">
              {{ $t(`product_subscriptions.how_it_works.rules.${rule.key}.items.${index - 1}`) }}
            </li>
          </ul>
        </VcWidget>
      </div>

      <VcWidget :title="$t('product_subscriptions.how_it_works.manage.title')" prepend-icon="settings">
        <div class="how-it-works__manage">
          <p>{{ $t("product_subscriptions.how_it_works.manage.text") }}</p>

          <VcButton
            :to="{ name: SUBSCRIPTIONS_ROUTE_NAME }"
            variant="outline"
            size="sm"
            data-test-id="how-it-works-subscriptions-button"
          >
            {{ $t("product_subscriptions.how_it_works.manage.button") }}
          </VcButton>
        </div>
      </VcWidget>
    </div>
  </VcContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { SUBSCRIPTIONS_ROUTE_NAME } from "../constants";

type StepKeyType = "choose" | "remind" | "deliver";
type RuleKeyType = "savings" | "prices" | "changes" | "payment" | "cancel" | "availability";

const STEPS: { key: StepKeyType; icon: string }[] = [
  { key: "choose", icon: "repeat" },
  { key: "remind", icon: "mail" },
  { key: "deliver", icon: "truck" },
];

/** `items` is the number of entries in the rule's `items` array in the locale files. */
const RULES: { key: RuleKeyType; icon: string; items: number }[] = [
  { key: "savings", icon: "badge-percent", items: 3 },
  { key: "prices", icon: "tag", items: 3 },
  { key: "changes", icon: "calendar-clock", items: 3 },
  { key: "payment", icon: "credit-card", items: 3 },
  { key: "cancel", icon: "circle-x", items: 3 },
  { key: "availability", icon: "package", items: 2 },
];

const { t } = useI18n();

usePageHead({ title: computed(() => t("product_subscriptions.how_it_works.title")) });
</script>

<style lang="scss">
.how-it-works {
  &__content {
    @apply flex flex-col gap-5;
  }

  &__lead {
    @apply -mt-2 max-w-3xl text-base text-neutral-700;
  }

  &__steps {
    @apply grid gap-5;

    @media (width >= theme("screens.md")) {
      @apply grid-cols-3;
    }
  }

  &__step {
    @apply flex items-start gap-3;
  }

  &__step-icon {
    @apply shrink-0;
  }

  &__step-text {
    @apply flex flex-col gap-1 text-sm text-neutral-700;
  }

  // A title inside the step: the heading font role, so a design that changes headings changes it too.
  &__step-title {
    @apply font-heading text-base font-bold text-neutral-950;
  }

  &__rules {
    @apply grid gap-5;

    @media (width >= theme("screens.md")) {
      @apply grid-cols-2;
    }

    @media (width >= theme("screens.xl")) {
      @apply grid-cols-3;
    }
  }

  &__list {
    @apply flex list-disc flex-col gap-2 ps-5 text-sm text-neutral-700;
  }

  &__manage {
    @apply flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-700;
  }
}
</style>
