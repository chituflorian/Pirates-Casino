<template>
  <div class="relative flex h-fit w-fit cursor-pointer items-center">
    <ShadowIcon class="absolute-center shine-component" />
    <div class="slot-container relative z-[1] flex items-center">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import ShadowIcon from "@/assets/svg/yellow-shadow.svg";
</script>

<style scoped>
.no-shine .shine-component,
.hoverable .shine-component {
  display: none;
}

.hoverable:has(.slot-container:hover) .shine-component {
  display: block;
}
</style>
