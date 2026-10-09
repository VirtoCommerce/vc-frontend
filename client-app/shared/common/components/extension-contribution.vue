<template>
  <slot v-bind="{ extensionProps: contributed }" />
</template>

<script lang="ts">
import { effectScope } from "vue";
import { Logger } from "@/core/utilities";

// `generic` makes the generated component type reference this interface, and <script setup>
// cannot carry ES exports.
export interface IProps<T> {
  /** Called ONCE, in this component's setup, so it may inject and register lifecycle hooks. */
  use: () => T;
}
</script>

<script setup lang="ts" generic="T">
const props = defineProps<IProps<T>>();

// A child scope of this component's own, so `use()`'s effects stop when this unmounts — and can
// be stopped early if it throws half-built.
const scope = effectScope();

let contributed: T | undefined;

try {
  contributed = scope.run(() => {
    const result = props.use();

    // The type says use() is sync, but a plugin is plain JS at the boundary.
    if (result instanceof Promise) {
      void result.catch((error: unknown) => {
        Logger.error("ExtensionContribution: use() rejected", error);
      });
    }

    return result;
  });
} catch (error) {
  Logger.error("ExtensionContribution: use() failed", error);
  // Whatever use() created before it threw would keep running until this unmounts otherwise.
  scope.stop();
}
</script>
