import { useFetch } from "@/composables/useFetch";
import { useUiStore } from "@/stores/ui";

export default {
  install: () => {
    return useFetch("/api/config").then(({ data, error }) => {
      if (!error.value) {
        const uiStore = useUiStore();
        uiStore.setConfig(data.value);
      }
    });
  },
};
