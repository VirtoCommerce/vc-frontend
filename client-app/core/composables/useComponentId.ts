import { getCurrentInstance } from "vue";

export default function useComponentId(prefix = "") {
  return prefix + getCurrentInstance()!.uid;
}
