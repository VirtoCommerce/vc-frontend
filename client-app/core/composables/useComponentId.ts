import { getCurrentInstance } from "vue";

export function useComponentId(prefix = ""): string {
  const uid = getCurrentInstance()!.uid.toString();
  return prefix ? prefix + "-" + uid : uid;
}
