<template>
  <p class="text-center md:py-10">
    {{ $t("shared.payment.manual.text") }}
    <router-link to="/contact" class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]">
      {{ $t("shared.payment.manual.link") }}
    </router-link>
    <span>.</span>
  </p>
</template>
