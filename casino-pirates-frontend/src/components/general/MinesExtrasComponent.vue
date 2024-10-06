<template>
  <PirateSkullIcon
    class="skull-icon absolute left-0 top-0 z-[2] hidden -translate-x-1/2 -translate-y-1/2 md:block md:h-[58px] md:w-[58px] xl:h-[68px] xl:w-[68px]"
  />
  <PirateSkullIcon
    class="skull-icon absolute right-0 top-0 z-[2] hidden -translate-y-1/2 translate-x-1/2 rotate-90 md:block md:h-[58px] md:w-[58px] xl:h-[68px] xl:w-[68px]"
  />
  <PirateSkullIcon
    class="skull-icon absolute bottom-0 left-0 z-[2] hidden -translate-x-1/2 translate-y-1/2 -rotate-90 md:block md:h-[58px] md:w-[58px] xl:h-[68px] xl:w-[68px]"
  />
  <PirateSkullIcon
    class="skull-icon absolute bottom-0 right-0 z-[2] hidden translate-x-1/2 translate-y-1/2 -rotate-180 md:block md:h-[58px] md:w-[58px] xl:h-[68px] xl:w-[68px]"
  />
  <div
    class="sidebar-wrapper-left absolute bottom-0 left-0 top-0 h-full w-3 md:w-6"
  ></div>
  <div
    class="sidebar-wrapper-right absolute bottom-0 right-0 top-0 h-full w-3 md:w-6"
  ></div>
  <div
    class="sidebar-wrapper-top absolute left-0 right-0 top-0 h-3 w-full md:h-6"
  ></div>
  <div
    class="sidebar-wrapper-bottom absolute bottom-0 left-0 right-0 h-3 w-full md:h-6"
  ></div>

  <div
    class="game-wrapper-shadow-side absolute bottom-0 left-0 top-0 z-[-2] w-6 md:w-10"
  ></div>
  <div
    class="game-wrapper-shadow-side absolute bottom-0 right-0 top-0 z-[-2] w-6 rotate-180 md:w-10"
  ></div>
  <div
    class="game-wrapper-shadow-head absolute left-0 right-0 top-0 z-[-2] h-6 md:h-10"
  ></div>
  <div
    class="game-wrapper-shadow-head absolute bottom-0 left-0 right-0 z-[-2] h-6 rotate-180 md:h-10"
  ></div>
</template>

<script setup>
import PirateSkullIcon from "@/assets/svg/mines/pirate-skull.svg";
</script>

<style scoped>
.sidebar-wrapper-top {
  background-image: url("/game-wrapper-top.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.sidebar-wrapper-left {
  background-image: url("/game-wrapper-left.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.sidebar-wrapper-right {
  background-image: url("/game-wrapper-right.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.sidebar-wrapper-bottom {
  background-image: url("/game-wrapper-bottom.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.game-wrapper-shadow-head {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}
.game-wrapper-shadow-side {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}
</style>
