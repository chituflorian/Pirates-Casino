<template>
  <EclipseButtonComponent>
    <ShineIcon class="absolute-center shine-component" />
    <div class="slot-container relative flex h-full w-full items-center">
      <slot></slot>
    </div>
  </EclipseButtonComponent>
</template>

<script setup>
import EclipseButtonComponent from "@/components/general/EclipseButtonComponent.vue";
import ShineIcon from "@/assets/svg/yellow-shadow.svg";
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
