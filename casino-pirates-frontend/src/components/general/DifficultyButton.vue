<template>
  <button
    :class="`difficulty-button ${difficulty} flex h-9 w-[172px] flex-row justify-between`"
  >
    <div class="flex flex-row gap-2">
      <ShiningButtonComponent v-if="selected">
        <component :is="icon" />
      </ShiningButtonComponent>
      <component :is="icon" v-else />

      <span class="font-outfit-bold text-xs text-[#777777]">
        {{ difficultyLabel }}
      </span>
    </div>

    <ShiningButtonComponent v-if="selected">
      <span class="selected font-outfit-semibold text-xs text-[#FFE619]">
        {{ count }} out of {{ total }}
      </span>
    </ShiningButtonComponent>
    <span v-else class="selected font-outfit-semibold text-xs text-[#777777]">
      {{ count }} out of {{ total }}
    </span>
  </button>
</template>

<script setup>
import { computed } from "vue";
import PistolIcon from "@/assets/svg/pistol.svg";
import SaberIcon from "@/assets/svg/saber.svg";
import HookIcon from "@/assets/svg/hook.svg";
import KrakenIcon from "@/assets/svg/kraken.svg";
import SkullIcon from "@/assets/svg/skull.svg";
import ShiningButtonComponent from "@/components/general/ShiningButtonComponent.vue";

const props = defineProps({
  difficulty: {
    type: String,
    default: "easy",
  },
  count: {
    type: Number,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const total = computed(() => {
  switch (props.difficulty) {
    case "nightmare":
      return 4;
    case "extreme":
      return 3;
    case "hard":
      return 2;
    case "medium":
      return 3;
    default:
      return 4;
  }
});

const difficultyLabel = computed(() => {
  return props.difficulty.charAt(0).toUpperCase() + props.difficulty.slice(1);
});

const icon = computed(() => {
  switch (props.difficulty) {
    case "hard":
      return PistolIcon;
    case "medium":
      return SaberIcon;
    case "extreme":
      return KrakenIcon;
    case "nightmare":
      return SkullIcon;
    default:
      return HookIcon;
  }
});
</script>

<style>
.difficulty-button {
  border-radius: 4px;
  background: #191919;
  box-shadow: 0px 0px 23px 3px #272727 inset;

  padding: 10px 12px;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.selected {
  color: #ffe619 !important;
}
</style>
