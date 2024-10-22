<template>
  <div v-if="isMultiOrganization" class="mt-4 flex grow flex-col gap-y-1 font-normal">
    <VcRadioButton
      v-for="item in allOrganizations"
      :key="item.id"
      v-model="contactOrganizationId"
      :value="item.id"
      class="py-2.5"
      @change="selectOrganization"
    >
      <span class="uppercase">
        {{ item.name }}
      </span>
    </VcRadioButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUser } from "@/shared/account";

const { user, allOrganizations, isMultiOrganization, switchOrganization } = useUser();
const contactOrganizationId = ref(user.value?.contact?.organizationId);
async function selectOrganization(): Promise<void> {
  if (!contactOrganizationId.value) {
    return;
  }

  await switchOrganization(contactOrganizationId.value);
}
</script>
