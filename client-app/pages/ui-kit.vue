<template>
  <div class="grow bg-gray-100 pb-16 pt-6 shadow-inner">
    <div class="mx-auto max-w-screen-2xl space-y-6 md:px-12">
      <!-- region Buttons -->
      <section class="bg-white px-6 pb-6 pt-5 md:rounded">
        <header class="mb-5 font-roboto text-2xl font-bold text-gray-600">Buttons</header>

        <div class="space-y-8">
          <!-- Small -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="sm" class="px-4 uppercase">primary</VcButton>
              <VcButton size="sm" kind="secondary" class="px-4 uppercase">secondary</VcButton>
              <VcButton size="sm" kind="success" class="px-4 uppercase">success</VcButton>
              <VcButton size="sm" kind="warning" class="px-4 uppercase">warning</VcButton>
              <VcButton size="sm" kind="danger" class="px-4 uppercase">danger</VcButton>
              <VcButton size="sm" kind="danger" class="px-4 uppercase" is-disabled>disabled</VcButton>
              <VcButton size="sm" kind="danger" class="px-4 uppercase" is-waiting>loading</VcButton>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="sm" class="px-4 uppercase" is-outline>primary</VcButton>
              <VcButton size="sm" kind="secondary" class="px-4 uppercase" is-outline>secondary</VcButton>
              <VcButton size="sm" kind="success" class="px-4 uppercase" is-outline>success</VcButton>
              <VcButton size="sm" kind="warning" class="px-4 uppercase" is-outline>warning</VcButton>
              <VcButton size="sm" kind="danger" class="px-4 uppercase" is-outline>danger</VcButton>
              <VcButton size="sm" kind="danger" class="px-4 uppercase" is-disabled is-outline>disabled</VcButton>
              <VcButton size="sm" kind="danger" class="px-4 uppercase" is-waiting is-outline>loading</VcButton>
            </div>
          </div>

          <!-- Medium -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcButton class="px-4 uppercase">primary</VcButton>
              <VcButton kind="secondary" class="px-4 uppercase">secondary</VcButton>
              <VcButton kind="success" class="px-4 uppercase">success</VcButton>
              <VcButton kind="warning" class="px-4 uppercase">warning</VcButton>
              <VcButton kind="danger" class="px-4 uppercase">danger</VcButton>
              <VcButton kind="danger" class="px-4 uppercase" is-disabled>disabled</VcButton>
              <VcButton kind="danger" class="px-4 uppercase" is-waiting>loading</VcButton>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton class="px-4 uppercase" is-outline>primary</VcButton>
              <VcButton kind="secondary" class="px-4 uppercase" is-outline>secondary</VcButton>
              <VcButton kind="success" class="px-4 uppercase" is-outline>success</VcButton>
              <VcButton kind="warning" class="px-4 uppercase" is-outline>warning</VcButton>
              <VcButton kind="danger" class="px-4 uppercase" is-outline>danger</VcButton>
              <VcButton kind="danger" class="px-4 uppercase" is-disabled is-outline>disabled</VcButton>
              <VcButton kind="danger" class="px-4 uppercase" is-waiting is-outline>loading</VcButton>
            </div>
          </div>

          <!-- Large -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="lg" class="px-4 uppercase">primary</VcButton>
              <VcButton size="lg" kind="secondary" class="px-4 uppercase">secondary</VcButton>
              <VcButton size="lg" kind="success" class="px-4 uppercase">success</VcButton>
              <VcButton size="lg" kind="warning" class="px-4 uppercase">warning</VcButton>
              <VcButton size="lg" kind="danger" class="px-4 uppercase">danger</VcButton>
              <VcButton size="lg" kind="danger" class="px-4 uppercase" is-disabled>disabled</VcButton>
              <VcButton size="lg" kind="danger" class="px-4 uppercase" is-waiting>loading</VcButton>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="lg" class="px-4 uppercase" is-outline>primary</VcButton>
              <VcButton size="lg" kind="secondary" class="px-4 uppercase" is-outline>secondary</VcButton>
              <VcButton size="lg" kind="success" class="px-4 uppercase" is-outline>success</VcButton>
              <VcButton size="lg" kind="warning" class="px-4 uppercase" is-outline>warning</VcButton>
              <VcButton size="lg" kind="danger" class="px-4 uppercase" is-outline>danger</VcButton>
              <VcButton size="lg" kind="danger" class="px-4 uppercase" is-disabled is-outline>disabled</VcButton>
              <VcButton size="lg" kind="danger" class="px-4 uppercase" is-waiting is-outline>loading</VcButton>
            </div>
          </div>

          <!-- Custom colors -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcButton class="px-4 uppercase [--color-primary-hover:green] [--color-primary:blue]">
                Custom color
              </VcButton>

              <VcButton class="px-4 uppercase [--color-primary-hover:green] [--color-primary:blue]" is-outline>
                Custom color
              </VcButton>

              <VcButton
                class="px-4 uppercase !text-black [--color-primary-hover:teal] [--color-primary:mediumaquamarine] hover:!text-gray-50"
              >
                Custom color
              </VcButton>

              <VcButton
                class="px-4 uppercase !text-black [--color-primary-hover:teal] [--color-primary:mediumaquamarine] hover:!bg-transparent hover:!text-red-700"
                is-outline
              >
                Custom color
              </VcButton>

              <span>— &nbsp; Custom colors</span>
            </div>
          </div>

          <!-- Bugs & Solutions -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcButton v-t="'common.buttons.submit'" class="px-4 uppercase"> test</VcButton>
              <VcButton v-t="'common.buttons.submit'" class="px-4 uppercase" is-waiting> loading</VcButton>
              <VcButton v-t="'common.buttons.submit'" class="px-4 uppercase" is-waiting is-outline> loading</VcButton>
              <span>— &nbsp; Bugs</span>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton class="px-4 uppercase">
                {{ $t("common.buttons.submit") }}
              </VcButton>

              <VcButton class="px-4 uppercase" is-waiting>
                {{ $t("common.buttons.submit") }}
              </VcButton>

              <VcButton class="px-4 uppercase" is-waiting is-outline>
                {{ $t("common.buttons.submit") }}
              </VcButton>

              <span>— &nbsp; Solution</span>
            </div>
          </div>
          <!-- -->
        </div>
      </section>
      <!-- endregion Buttons -->

      <!-- region Chips -->
      <section class="bg-white px-6 pb-6 pt-5 md:rounded">
        <header class="mb-5 font-roboto text-2xl font-bold text-gray-600">Chips</header>

        <div class="space-y-8">
          <!-- Small -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcChip size="sm" clickable>Primary Clickable</VcChip>
              <VcChip size="sm" variant="secondary" is-draggable>Secondary Draggable</VcChip>
              <VcChip size="sm" variant="success" closable @close="alert('Chip closing event')">
                Success Closable
              </VcChip>
              <VcChip size="sm" variant="warning">Warning</VcChip>
              <VcChip size="sm" variant="danger">Danger</VcChip>
              <VcChip size="sm" variant="danger" is-disabled>Disabled</VcChip>
              <VcChip size="sm" variant="danger" is-disabled closable>Disabled Closable</VcChip>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcChip size="sm" is-outline clickable>Primary Clickable</VcChip>
              <VcChip size="sm" variant="secondary" is-outline is-draggable>Secondary Draggable</VcChip>
              <VcChip size="sm" variant="success" is-outline closable @close="alert('Chip closing event')">
                Success Closable
              </VcChip>
              <VcChip size="sm" variant="warning" is-outline>Warning</VcChip>
              <VcChip size="sm" variant="danger" is-outline>Danger</VcChip>
              <VcChip size="sm" variant="danger" is-disabled is-outline>Disabled</VcChip>
              <VcChip size="sm" variant="danger" is-disabled is-outline closable>Disabled Closable</VcChip>
            </div>
          </div>

          <!-- Medium -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcChip clickable>Primary Clickable</VcChip>
              <VcChip variant="secondary" is-draggable>Secondary Draggable</VcChip>
              <VcChip variant="success" closable @close="alert('Chip closing event')"> Success Closable</VcChip>
              <VcChip variant="warning">Warning</VcChip>
              <VcChip variant="danger">Danger</VcChip>
              <VcChip variant="danger" is-disabled>Disabled</VcChip>
              <VcChip variant="danger" is-disabled closable>Disabled Closable</VcChip>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcChip is-outline clickable>Primary Clickable</VcChip>
              <VcChip variant="secondary" is-outline is-draggable>Secondary Draggable</VcChip>
              <VcChip variant="success" is-outline closable @close="alert('Chip closing event')">
                Success Closable
              </VcChip>
              <VcChip variant="warning" is-outline>Warning</VcChip>
              <VcChip variant="danger" is-outline>Danger</VcChip>
              <VcChip variant="danger" is-disabled is-outline>Disabled</VcChip>
              <VcChip variant="danger" is-disabled is-outline closable>Disabled Closable</VcChip>
            </div>
          </div>

          <!-- Large -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcChip size="lg" clickable>Primary Clickable</VcChip>
              <VcChip size="lg" variant="secondary" is-draggable>Secondary Draggable</VcChip>
              <VcChip size="lg" variant="success" closable @close="alert('Chip closing event')">
                Success Closable
              </VcChip>
              <VcChip size="lg" variant="warning">Warning</VcChip>
              <VcChip size="lg" variant="danger">Danger</VcChip>
              <VcChip size="lg" variant="danger" is-disabled>Disabled</VcChip>
              <VcChip size="lg" variant="danger" is-disabled closable>Disabled Closable</VcChip>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcChip size="lg" is-outline clickable>Primary Clickable</VcChip>
              <VcChip size="lg" variant="secondary" is-outline is-draggable>Secondary Draggable</VcChip>
              <VcChip size="lg" variant="success" is-outline closable @close="alert('Chip closing event')">
                Success Closable
              </VcChip>
              <VcChip size="lg" variant="warning" is-outline>Warning</VcChip>
              <VcChip size="lg" variant="danger" is-outline>Danger</VcChip>
              <VcChip size="lg" variant="danger" is-disabled is-outline>Disabled</VcChip>
              <VcChip size="lg" variant="danger" is-disabled is-outline closable>Disabled Closable</VcChip>
            </div>
          </div>
          <!-- -->
        </div>
      </section>
      <!-- endregion Chips -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageHead } from "@/core/composables";

usePageHead({
  title: "Dev UI Kit",
});

function alert(message?: any) {
  window.alert(message);
}
</script>
