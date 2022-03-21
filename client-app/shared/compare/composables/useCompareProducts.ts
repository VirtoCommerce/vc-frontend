import { computed, readonly } from "vue";

const count = computed<number>(() => 0);

export default () => {
  return {
    count: readonly(count),
  };
};
