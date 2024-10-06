<template>
  <div
    class="card-container flex-center relative aspect-square h-full w-full bg-woodsmoke-980"
  >
    <div
      class="absolute right-0 top-0 h-1 w-1 border-r border-t border-woodsmoke-400 md:h-2 md:w-2"
    ></div>
    <div
      class="absolute left-0 top-0 h-1 w-1 border-l border-t border-woodsmoke-400 md:h-2 md:w-2"
    ></div>
    <div
      class="absolute bottom-0 left-0 h-1 w-1 border-b border-l border-woodsmoke-400 md:h-2 md:w-2"
    ></div>
    <div
      class="absolute bottom-0 right-0 h-1 w-1 border-b border-r border-woodsmoke-400 md:h-2 md:w-2"
    ></div>
    <div
      class="card-center-mark relative rounded-[50%] border border-woodsmoke-400 p-1.5"
    >
      <div
        class="absolute-center-x top-0 h-1.5 w-[1px] -translate-y-1/2 rounded bg-woodsmoke-400 md:h-2.5"
      ></div>
      <div
        class="absolute-center-y right-0 h-1.5 w-[1px] translate-x-1/2 rotate-90 rounded bg-woodsmoke-400 md:h-2.5"
      ></div>
      <div
        class="absolute-center-y left-0 h-1.5 w-[1px] -translate-x-1/2 rotate-90 rounded bg-woodsmoke-400 md:h-2.5"
      ></div>
      <div
        class="absolute-center-x bottom-0 h-1.5 w-[1px] translate-y-1/2 rounded bg-woodsmoke-400 md:h-2.5"
      ></div>
      <div
        class="flex-center card-question-mark-container aspect-square h-3 md:h-5 xxl:h-[25px]"
      >
        <span
          class="card-question-mark font-outfit text-sm leading-[1.2] text-woodsmoke-400 md:text-base lg:text-xl"
          >?</span
        >
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped></style>
