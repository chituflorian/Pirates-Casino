<template>
  <EclipseButtonComponent
    class="flex w-full px-2.5 md:px-4 [&_.eclipse-icon]:rounded"
  >
    <div
      class="flex h-8 w-full items-center justify-between gap-2 md:h-8 md:gap-3 xxl:h-10"
    >
      <div class="flex flex-row items-center justify-center gap-3 md:gap-4">
        <div class="flex h-5 w-[112px] flex-row items-center md:w-[148px]">
          <slot name="combination">
            <Diamond
              class="h-4 w-4 xxl:h-5 xxl:w-5"
              v-for="index in 5"
              :key="index"
            />
          </slot>
        </div>

        <div
          id="multiplier"
          style="
            background: #191919;
            box-shadow: 0px 0px 23px 3px #272727 inset;
          "
          class="h-3 w-[34px] rounded-3xl md:h-5 md:w-[54px]"
        >
          <span
            class="profit mt-[-0.5px] flex items-center justify-center font-outfit text-[8px] font-semibold md:mt-0 md:pt-0.5 md:text-xs"
            >{{ formattedMultiplier }}x</span
          >
        </div>
      </div>
      <div class="flex flex-row gap-1 md:gap-2">
        <ShiningButtonComponent>
          <CoinIcon class="h-4 w-4 md:h-5 md:w-5" />
        </ShiningButtonComponent>
        <span
          class="font-outfit-bold text-xs text-[#FFE619] md:font-outfit-semibold md:text-base"
          >{{ formattedTotal }}</span
        >
      </div>
    </div>
  </EclipseButtonComponent>
</template>

<script setup>
import EclipseButtonComponent from "@/components/general/EclipseButtonComponent.vue";
import Diamond from "@/assets/svg/gems/diamond.svg";
import CoinIcon from "@/assets/svg/coin.svg";
import ShiningButtonComponent from "@/components/general/ShiningButtonComponent.vue";
import { computed } from "vue";

const props = defineProps({
  multiplier: {
    type: Number,
    default: 0,
  },
  betAmount: {
    type: Number,
    default: 1,
  },
});

const formattedMultiplier = computed(() => {
  return props.multiplier.toFixed(2);
});

const formattedTotal = computed(() => {
  const total = props.betAmount * props.multiplier;
  return total.toLocaleString();
});
</script>

<style scoped></style>
