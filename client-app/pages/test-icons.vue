<template>
  <div>
    <section class="container mx-auto px-6 py-12 md:px-12">
      <div class="mb-8">
        <h3 class="mb-4 text-2xl font-bold">Demo: HugeIcons vs VcIcon</h3>

        <div class="grid grid-cols-1 gap-6 rounded-lg bg-neutral-100 p-6 md:grid-cols-2 lg:grid-cols-4">
          <div class="bg-white flex flex-col items-center gap-2 rounded p-4">
            <h4 class="text-sm font-semibold">VcIcon Current</h4>

            <VcIcon name="arrow-right" size="xxs" color="primary" />

            <VcIcon name="search" size="xs" color="primary" />

            <VcIcon name="document-text" size="sm" color="primary" />

            <VcIcon name="check-circle" size="md" color="success" />

            <VcIcon name="delete" size="lg" color="danger" />

            <VcIcon name="qwerty" size="lg" color="danger" />
          </div>

          <div class="bg-white flex flex-col items-center gap-2 rounded p-4">
            <h4 class="text-sm font-semibold">VcIconNew UI components</h4>

            <VcIconNew name="ArrowRight01Icon" size="xxs" color="primary" />

            <VcIconNew name="Search01Icon" size="xs" color="warning" />

            <VcIconNew name="File01Icon" size="sm" color="accent" />

            <VcIconNew name="CheckmarkCircle02Icon" size="md" color="success" />

            <VcIconNew name="Delete01Icon" size="lg" color="danger" />

            <VcIconNew name="qwerty" size="lg" color="danger" />
          </div>

          <div class="bg-white flex flex-col items-center gap-2 rounded p-4">
            <h4 class="text-sm font-semibold">Sizes</h4>

            <div class="flex items-center gap-2">
              <VcIconNew name="Home01Icon" size="xxs" color="primary" />

              <span class="text-xs">10px(xxs)</span>
            </div>

            <div class="flex items-center gap-2">
              <VcIconNew name="Home01Icon" size="xs" color="primary" />

              <span class="text-xs">14px(xs)</span>
            </div>

            <div class="flex items-center gap-2">
              <VcIconNew name="Home01Icon" size="sm" color="primary" />

              <span class="text-xs">20px(sm)</span>
            </div>

            <div class="flex items-center gap-2">
              <VcIconNew name="Home01Icon" size="md" color="primary" />

              <span class="text-xs">24px(md)</span>
            </div>

            <div class="flex items-center gap-2">
              <VcIconNew name="Home01Icon" size="lg" color="primary" />

              <span class="text-xs">40px(lg)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts"></script>
