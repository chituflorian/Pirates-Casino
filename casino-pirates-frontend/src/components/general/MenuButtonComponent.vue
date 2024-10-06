<template>
  <div class="relative flex w-full cursor-pointer items-center">
    <EclipseIcon
      class="absolute-full eclipse-icon h-full w-full rounded-[8px]"
    />
    <div class="relative flex w-full items-center">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import EclipseIcon from "@/assets/svg/eclipse.svg";
</script>

<style scoped></style>
