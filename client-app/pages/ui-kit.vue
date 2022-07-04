<template>
  <div class="bg-gray-100 grow pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto space-y-6">
      <!-- region Buttons -->
      <section class="bg-white md:rounded px-6 pt-5 pb-6">
        <header class="text-2xl text-gray-600 font-bold font-roboto mb-5">Buttons</header>

        <div class="space-y-8">
          <!-- Small -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="sm" class="uppercase px-4" autofocus>primary</VcButton>
              <VcButton size="sm" kind="secondary" class="uppercase px-4">secondary</VcButton>
              <VcButton size="sm" kind="success" class="uppercase px-4">success</VcButton>
              <VcButton size="sm" kind="warning" class="uppercase px-4">warning</VcButton>
              <VcButton size="sm" kind="danger" class="uppercase px-4">danger</VcButton>
              <VcButton size="sm" kind="danger" class="uppercase px-4" is-disabled>disabled</VcButton>
              <VcButton size="sm" kind="danger" class="uppercase px-4" is-waiting>loading</VcButton>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="sm" class="uppercase px-4" is-outline>primary</VcButton>
              <VcButton size="sm" kind="secondary" class="uppercase px-4" is-outline>secondary</VcButton>
              <VcButton size="sm" kind="success" class="uppercase px-4" is-outline>success</VcButton>
              <VcButton size="sm" kind="warning" class="uppercase px-4" is-outline>warning</VcButton>
              <VcButton size="sm" kind="danger" class="uppercase px-4" is-outline>danger</VcButton>
              <VcButton size="sm" kind="danger" class="uppercase px-4" is-disabled is-outline>disabled</VcButton>
              <VcButton size="sm" kind="danger" class="uppercase px-4" is-waiting is-outline>loading</VcButton>
            </div>
          </div>

          <!-- Medium -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcButton class="uppercase px-4">primary</VcButton>
              <VcButton kind="secondary" class="uppercase px-4">secondary</VcButton>
              <VcButton kind="success" class="uppercase px-4">success</VcButton>
              <VcButton kind="warning" class="uppercase px-4">warning</VcButton>
              <VcButton kind="danger" class="uppercase px-4">danger</VcButton>
              <VcButton kind="danger" class="uppercase px-4" is-disabled>disabled</VcButton>
              <VcButton kind="danger" class="uppercase px-4" is-waiting>loading</VcButton>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton class="uppercase px-4" is-outline>primary</VcButton>
              <VcButton kind="secondary" class="uppercase px-4" is-outline>secondary</VcButton>
              <VcButton kind="success" class="uppercase px-4" is-outline>success</VcButton>
              <VcButton kind="warning" class="uppercase px-4" is-outline>warning</VcButton>
              <VcButton kind="danger" class="uppercase px-4" is-outline>danger</VcButton>
              <VcButton kind="danger" class="uppercase px-4" is-disabled is-outline>disabled</VcButton>
              <VcButton kind="danger" class="uppercase px-4" is-waiting is-outline>loading</VcButton>
            </div>
          </div>

          <!-- Large -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="lg" class="uppercase px-4">primary</VcButton>
              <VcButton size="lg" kind="secondary" class="uppercase px-4">secondary</VcButton>
              <VcButton size="lg" kind="success" class="uppercase px-4">success</VcButton>
              <VcButton size="lg" kind="warning" class="uppercase px-4">warning</VcButton>
              <VcButton size="lg" kind="danger" class="uppercase px-4">danger</VcButton>
              <VcButton size="lg" kind="danger" class="uppercase px-4" is-disabled>disabled</VcButton>
              <VcButton size="lg" kind="danger" class="uppercase px-4" is-waiting>loading</VcButton>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="lg" class="uppercase px-4" is-outline>primary</VcButton>
              <VcButton size="lg" kind="secondary" class="uppercase px-4" is-outline>secondary</VcButton>
              <VcButton size="lg" kind="success" class="uppercase px-4" is-outline>success</VcButton>
              <VcButton size="lg" kind="warning" class="uppercase px-4" is-outline>warning</VcButton>
              <VcButton size="lg" kind="danger" class="uppercase px-4" is-outline>danger</VcButton>
              <VcButton size="lg" kind="danger" class="uppercase px-4" is-disabled is-outline>disabled</VcButton>
              <VcButton size="lg" kind="danger" class="uppercase px-4" is-waiting is-outline>loading</VcButton>
            </div>
          </div>

          <!-- Custom colors -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcButton class="uppercase px-4 [--color-primary:blue] [--color-primary-hover:green]">
                Custom color
              </VcButton>

              <VcButton class="uppercase px-4 [--color-primary:blue] [--color-primary-hover:green]" is-outline>
                Custom color
              </VcButton>

              <VcButton
                class="uppercase px-4 [--color-primary:mediumaquamarine] [--color-primary-hover:teal] !text-black hover:!text-gray-50"
              >
                Custom color
              </VcButton>

              <VcButton
                class="uppercase px-4 [--color-primary:mediumaquamarine] [--color-primary-hover:teal] !text-black hover:!text-red-700 hover:!bg-transparent"
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
              <VcButton v-t="'common.buttons.submit'" class="uppercase px-4"> test</VcButton>
              <VcButton v-t="'common.buttons.submit'" class="uppercase px-4" is-waiting> loading</VcButton>
              <VcButton v-t="'common.buttons.submit'" class="uppercase px-4" is-waiting is-outline> loading</VcButton>
              <span>— &nbsp; Bugs</span>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton class="uppercase px-4">
                {{ $t("common.buttons.submit") }}
              </VcButton>

              <VcButton class="uppercase px-4" is-waiting>
                {{ $t("common.buttons.submit") }}
              </VcButton>

              <VcButton class="uppercase px-4" is-waiting is-outline>
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
      <section class="bg-white md:rounded px-6 pt-5 pb-6">
        <header class="text-2xl text-gray-600 font-bold font-roboto mb-5">Chips</header>

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
