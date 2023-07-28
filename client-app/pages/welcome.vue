<template>
  <!--  Title in tab? -->
  <!-- breadcrumbs? -->
  <VcEmptyPage
    title="Registration completed"
    description="Thank you for showing you interest in registering with us. We kindly ask you to check your mailbox in order to verify email address you’ve entered."
    image="/static/images/illustrations/emails.webp"
  >
    <template #actions>
      <div class="flex flex-wrap justify-center gap-5 lg:justify-start">
        <VcButton :to="{ name: 'Home' }" size="lg">
          {{ $t("common.buttons.continue_shopping") }}
        </VcButton>
        <VcButton :to="{ name: 'SignIn' }" size="lg"> Sign In </VcButton>
      </div>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts"></script>
