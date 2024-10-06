import { useUiStore } from "@/stores/ui";

export function useAudio(path) {
  const uiStore = useUiStore();
  let audio = new Audio(path);
  audio.volume = uiStore.getPercentageSoundVolume;
  audio.play();
}
