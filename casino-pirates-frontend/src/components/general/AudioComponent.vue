<template>
  <audio ref="audioElement" loop autoplay>
    <source src="/theme/adventure.mp3" />
  </audio>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useUiStore } from "@/stores/ui";

const uiStore = useUiStore();
const audioElement = ref(null);
const audioPlayed = ref(false);

onMounted(() => {
  if (audioElement.value) {
    if (audioElement.value.paused) {
      audioElement.value.volume = uiStore.getPercentageSoundVolume;
      document.addEventListener("click", handleFirstPlay, false);
    }
  }
});
watch(
  () => uiStore.getPercentageSoundVolume,

  (newVolume) => {
    if (audioElement.value) {
      audioElement.value.volume = newVolume;
    }
  }
);
function handleFirstPlay() {
  if (!audioPlayed.value && audioElement.value) {
    audioPlayed.value = true;
    audioElement.value.play();
    document.removeEventListener("click", handleFirstPlay);
  }
}
</script>

<style scoped></style>
