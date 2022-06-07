import { readonly, ref } from "vue";

const isBodyScrollable = ref(true);

export default () => {
  function toggleBodyScrollable(value = true) {
    isBodyScrollable.value = value;
  }

  return {
    isBodyScrollable: readonly(isBodyScrollable),
    toggleBodyScrollable,
  };
};
