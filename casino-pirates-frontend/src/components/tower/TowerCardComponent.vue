<template>
  <div
    class="card-container flex-center relative h-full w-full bg-woodsmoke-980"
  >
    <div
      class="active absolute right-0 top-0 h-1 w-1 border-r border-t border-woodsmoke-400 md:h-2 md:w-2"
    ></div>
    <div
      class="active absolute left-0 top-0 h-1 w-1 border-l border-t border-woodsmoke-400 md:h-2 md:w-2"
    ></div>
    <div
      class="active absolute bottom-0 left-0 h-1 w-1 border-b border-l border-woodsmoke-400 md:h-2 md:w-2"
    ></div>
    <div
      class="active absolute bottom-0 right-0 h-1 w-1 border-b border-r border-woodsmoke-400 md:h-2 md:w-2"
    ></div>
    <span
      class="active shrink-0 font-outfit-semibold text-xs text-[#8C8C8C] md:text-base"
      >{{ multiplier }}x</span
    >
  </div>
</template>

<script setup>
const props = defineProps({
  multiplier: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped></style>
