<template>
  <div ref="scrollContainer" v-if="isMultiOrganization" class="multi-organization-menu">
    <VcAlert
      v-if="switchError"
      class="multi-organization-menu__error"
      color="danger"
      size="sm"
      variant="outline-dark"
      icon
    >
      {{ switchError }}
    </VcAlert>

    <VcRadioButton
      v-if="organization && !loading"
      :model-value="contactOrganizationId"
      :value="organization.id"
      class="multi-organization-menu__radio"
    >
      <span class="multi-organization-menu__radio-label">
        {{ organization.name }}
      </span>
    </VcRadioButton>

    <VcRadioButton
      v-for="item in organizationsWithoutCurrent"
      :key="item.id"
      v-model="contactOrganizationId"
      :value="item.id"
      class="multi-organization-menu__radio"
      @change="selectOrganization"
    >
      <span class="multi-organization-menu__radio-label">
        {{ item.name }}
      </span>
    </VcRadioButton>

    <VcInfinityScrollLoader
      v-if="hasNextPage"
      :loading="loading"
      :viewport="scrollContainer"
      :page-number="currentPage"
      :pages-count="pagesCount"
      distance="50"
      class="multi-organization-menu__loader"
      @visible="loadOrganizations"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, computed } from "vue";
import { useOrganizationSwitcher, useUser, useUserOrganizations } from "@/shared/account";

const { organizations, hasNextPage, loading, pagesCount, currentPage, loadOrganizations } = useUserOrganizations();
const { user, isMultiOrganization, organization } = useUser();
const { switchError, trySwitch } = useOrganizationSwitcher();

const contactOrganizationId = ref(user.value?.contact?.organizationId);
const scrollContainer = useTemplateRef("scrollContainer");

const organizationsWithoutCurrent = computed(() =>
  organizations.value.filter((item) => item.id !== organization.value?.id),
);

async function selectOrganization(): Promise<void> {
  if (!contactOrganizationId.value) {
    return;
  }

  const succeeded = await trySwitch(contactOrganizationId.value);

  if (!succeeded) {
    contactOrganizationId.value = user.value?.contact?.organizationId;
  }
}
</script>

<style lang="scss">
.multi-organization-menu {
  @apply mt-4 flex grow flex-col gap-y-1 font-normal h-[calc(100vh-224px)] overflow-y-auto;

  &__error {
    @apply mb-2;
  }

  &__radio {
    @apply py-2.5;
  }

  &__radio-label {
    @apply uppercase;
  }

  &__loader {
    @apply py-2;
  }
}
</style>
