<template>
  <div
    class="game-plan card-game-container relative m-3 flex grow items-end justify-center md:m-6 md:p-6 xl:pt-0 xxl:m-8"
  >
    <div class="flex w-fit items-center md:gap-5 lg:gap-[30px] xl:gap-[72px]">
      <slot name="before"></slot>
      <div class="flex w-full flex-col items-center justify-center">
        <div
          class="top-elements-container relative z-[2] flex translate-y-3 items-end justify-center md:hidden md:translate-y-6 xl:flex"
        >
          <slot name="top-items"></slot>
        </div>
        <div
          class="game-container relative z-[1] h-full w-[90vw] bg-woodsmoke-960 p-6 tn:h-fit tn:w-[400px] md:h-[588px] md:w-[450px] xxl:h-[692px] xxl:w-[504px]"
        >
          <MinesExtrasComponent />
          <slot name="content"></slot>
        </div>
      </div>
      <slot name="after"></slot>
    </div>
    <div class="helpers hidden sm:flex">
      <div class="absolute right-8 top-8 flex items-center gap-4">
        <EclipseButtonComponent>
          <div class="flex-center h-12 w-12">
            <InfoIcon />
          </div>
        </EclipseButtonComponent>
        <EclipseButtonComponent>
          <div class="flex-center h-12 w-12">
            <ShieldIcon />
          </div>
        </EclipseButtonComponent>
      </div>
      <div class="absolute left-8 top-8 flex items-center gap-4">
        <EclipseButtonComponent>
          <div class="flex-center h-12 gap-3 px-6">
            <WifiIcon />
            <span
              class="whitespace-nowrap font-outfit-medium text-chartreuse-400"
              >25 ms</span
            >
          </div>
        </EclipseButtonComponent>
      </div>
    </div>
  </div>
</template>

<script setup>
import MinesExtrasComponent from "@/components/general/MinesExtrasComponent.vue";
import InfoIcon from "@/assets/svg/information-circle.svg";
import WifiIcon from "@/assets/svg/wifi.svg";
import ShieldIcon from "@/assets/svg/shield-check.svg";
import EclipseButtonComponent from "@/components/general/EclipseButtonComponent.vue";
</script>

<style lang="scss" scoped>
.game-plan {
  @media only screen and (min-width: 846px) {
    border-radius: 8px;
    border: 1px solid #282828;
    background: linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.85) 0%,
        rgba(0, 0, 0, 0.85) 100%
      ),
      url("/pirates-background.png");
    box-shadow: 0px 16px 94px 20px rgba(0, 0, 0, 0.02);
    background-size: cover;
    background-position: 25% center;
  }
}

.game-container {
  border: 1px solid #282828;
  /*background: #1a1919;*/
  box-shadow: 0 16px 94px 20px rgba(0, 0, 0, 0.02);
}

@media (max-width: 576px) and (min-aspect-ratio: 389/828) {
  .top-elements-container {
    display: none;
  }
}
</style>
