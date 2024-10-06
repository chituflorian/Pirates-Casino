import { useUiStore } from "@/stores/ui";

export function useConfig(label = null) {
  const uiStore = useUiStore();
  let config = uiStore.getConfig;
  if (!config) return null;
  if (label) {
    config = Object.keys(config).reduce((acc, key) => {
      if (key.startsWith(label)) {
        let newKey = key.split(".")[1];
        acc[newKey] = config[key];
      }
      return acc;
    }, {});
  }
  return config;
}
