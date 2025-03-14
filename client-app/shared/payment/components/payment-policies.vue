<template>
  <p class="payment-policies">
    {{ $t(title) }}

    <router-link :to="agreementLink" class="payment-policies__link">
      {{ $t(agreementLocale) }}
    </router-link>

    {{ $t(personalDataLocale) }}

    <router-link :to="policyLink" class="payment-policies__link">
      {{ $t(policyLocale) }}
    </router-link>
  </p>
</template>

<script setup lang="ts">
interface IProps {
  title?: string;
  personalDataLocale?: string;
  agreementLink?: string;
  agreementLocale?: string;
  policyLink?: string;
  policyLocale?: string;
}

withDefaults(defineProps<IProps>(), {
  title: "shared.payment.authorize_net.accept_terms_text",
  personalDataLocale: "shared.payment.authorize_net.processing_personal_data_text",
  agreementLink: "/agreement",
  agreementLocale: "shared.payment.authorize_net.user_agreement_link",
  policyLink: "/policy",
  policyLocale: "shared.payment.authorize_net.privacy_policy_link",
});
</script>

<style lang="scss">
.payment-policies {
  @apply text-center text-sm text-neutral md:text-left;

  &__link {
    @apply text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
