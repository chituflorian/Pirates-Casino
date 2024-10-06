<script setup>
import { defineProps } from "vue";
import EclipseButtonComponent from "@/components/general/EclipseButtonComponent.vue";

const props = defineProps({
  backgroundColor: {
    type: String,
    default: "#777777",
  },
});
</script>

<template>
  <div class="flex flex-col gap-2 md:gap-3 xxl:gap-4">
    <EclipseButtonComponent
      id="gem"
      class="[&_.eclipse-icon]:[68px] flex items-center justify-center p-3 md:h-[50px] md:w-[50px] md:p-4 xl:h-[60px] xl:w-[60px] xxl:h-[68px] xxl:w-[68px]"
    >
      <slot name="Icon"></slot>
    </EclipseButtonComponent>
    <div
      id="bottom-bar"
      :style="{
        boxShadow: '0px 16px 94px 20px rgba(0, 0, 0, 0.02)',
        backgroundColor: props.backgroundColor,
      }"
      class="h-0.5 w-[44px] rounded-[128px] md:w-[50px] xl:h-1 xl:w-[60px] xxl:w-[68px]"
    ></div>
  </div>
</template>

<style lang="scss" scoped></style>
