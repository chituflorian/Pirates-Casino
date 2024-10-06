<template>
  <div class="flex gap-3">
    <component
      :is="getComponentForLetter(letter)"
      v-for="(letter, index) in fiveGems"
      :key="index"
      class="h-4 w-4 md:h-5 md:w-5"
    />
  </div>
</template>
<script setup>
import PurpleGemIcon from "@/assets/svg/gems/purple-gem.svg";
import RedGemIcon from "@/assets/svg/gems/red-gem.svg";
import GreenGemIcon from "@/assets/svg/gems/green-gem.svg";
import GreenDiamondIcon from "@/assets/svg/gems/green-diamond.svg";
import BlueGemIcon from "@/assets/svg/gems/blue-gem.svg";
import YellowDiamond from "@/assets/svg/gems/yellow-diamond.svg";
import RedDiamond from "@/assets/svg/gems/red-diamond.svg";
import DiamondBlank from "@/assets/svg/gems/diamond-blank.svg";
import { computed } from "vue";

const props = defineProps({
  profit: {
    type: Array,
    default: () => [],
  },
});

const topGems = {
  a: RedGemIcon,
  b: GreenGemIcon,
  c: BlueGemIcon,
  d: PurpleGemIcon,
  e: GreenDiamondIcon,
  f: YellowDiamond,
  g: RedDiamond,
};

const getComponentForLetter = (letter) => {
  return topGems[letter] || DiamondBlank;
};

const fiveGems = computed(() => {
  const gems = [...props.profit];

  while (gems.length <= 5) {
    gems.push("blank");
  }

  return gems.slice(0, 5);
});
</script>
