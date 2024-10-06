<template>
  <div class="relative flex h-fit w-fit cursor-pointer items-center">
    <EclipseIcon
      class="absolute-full eclipse-icon h-full w-full rounded-[120px]"
    />
    <div class="slot-container relative flex w-full items-center">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import EclipseIcon from "@/assets/svg/eclipse.svg";
</script>

<style scoped>
.hoverable .eclipse-icon {
  fill: #191919;
  box-shadow: 0px 0px 23px 3px #272727 inset;
}

.hoverable:has(.slot-container:hover) .eclipse-icon {
  fill: #191919;
  box-shadow: 0px 0px 30px 6px #272727 inset;
}
</style>
