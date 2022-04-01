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
              <VcButton kind="secondary" size="sm" class="uppercase px-4">secondary</VcButton>
              <VcButton kind="success" size="sm" class="uppercase px-4">success</VcButton>
              <VcButton kind="warning" size="sm" class="uppercase px-4">warning</VcButton>
              <VcButton kind="danger" size="sm" class="uppercase px-4">danger</VcButton>
              <VcButton size="sm" class="uppercase px-4" is-disabled>disabled</VcButton>
              <VcButton size="sm" class="uppercase px-4" is-waiting>loading</VcButton>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="sm" class="uppercase px-4" is-outline>primary</VcButton>
              <VcButton kind="secondary" size="sm" class="uppercase px-4" is-outline>secondary</VcButton>
              <VcButton kind="success" size="sm" class="uppercase px-4" is-outline>success</VcButton>
              <VcButton kind="warning" size="sm" class="uppercase px-4" is-outline>warning</VcButton>
              <VcButton kind="danger" size="sm" class="uppercase px-4" is-outline>danger</VcButton>
              <VcButton size="sm" class="uppercase px-4" is-disabled is-outline>disabled</VcButton>
              <VcButton size="sm" class="uppercase px-4" is-waiting is-outline>loading</VcButton>
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
              <VcButton class="uppercase px-4" is-disabled>disabled</VcButton>
              <VcButton class="uppercase px-4" is-waiting>loading</VcButton>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton class="uppercase px-4" is-outline>primary</VcButton>
              <VcButton kind="secondary" class="uppercase px-4" is-outline>secondary</VcButton>
              <VcButton kind="success" class="uppercase px-4" is-outline>success</VcButton>
              <VcButton kind="warning" class="uppercase px-4" is-outline>warning</VcButton>
              <VcButton kind="danger" class="uppercase px-4" is-outline>danger</VcButton>
              <VcButton class="uppercase px-4" is-disabled is-outline>disabled</VcButton>
              <VcButton class="uppercase px-4" is-waiting is-outline>loading</VcButton>
            </div>
          </div>

          <!-- Large -->
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="lg" class="uppercase px-4">primary</VcButton>
              <VcButton kind="secondary" size="lg" class="uppercase px-4">secondary</VcButton>
              <VcButton kind="success" size="lg" class="uppercase px-4">success</VcButton>
              <VcButton kind="warning" size="lg" class="uppercase px-4">warning</VcButton>
              <VcButton kind="danger" size="lg" class="uppercase px-4">danger</VcButton>
              <VcButton size="lg" class="uppercase px-4" is-disabled>disabled</VcButton>
              <VcButton size="lg" class="uppercase px-4" is-waiting>loading</VcButton>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <VcButton size="lg" class="uppercase px-4" is-outline>primary</VcButton>
              <VcButton kind="secondary" size="lg" class="uppercase px-4" is-outline>secondary</VcButton>
              <VcButton kind="success" size="lg" class="uppercase px-4" is-outline>success</VcButton>
              <VcButton kind="warning" size="lg" class="uppercase px-4" is-outline>warning</VcButton>
              <VcButton kind="danger" size="lg" class="uppercase px-4" is-outline>danger</VcButton>
              <VcButton size="lg" class="uppercase px-4" is-disabled is-outline>disabled</VcButton>
              <VcButton size="lg" class="uppercase px-4" is-waiting is-outline>loading</VcButton>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcButton } from "@/components";
</script>
