<template>
  <div class="range-container relative z-[1] flex h-fit w-fit items-center">
    <input
      type="range"
      tabindex="1"
      v-model="rangeValue"
      class="w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
      :min="min"
      :max="max"
    />
    <div
      tabindex="-1"
      class="absolute-full range-tail z-[-1] h-full rounded-l-[120px] bg-turbo-400"
      :style="{ width: `${(rangeValue * 100) / (max - min)}%` }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: 40,
  },
  min: {
    type: [Number, String],
    default: 0,
  },
  max: {
    type: [Number, String],
    default: 100,
  },
});

const emit = defineEmits(["update:modelValue"]);

const rangeValue = computed({
  get() {
    return props.modelValue;
  },
  set(newRangeValue) {
    emit("update:modelValue", newRangeValue);
  },
});
</script>

<style scoped>
input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: transparent;
  outline: none;
}
input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 8px;
  height: 8px;
  background: #ffe619;
  box-shadow: 0px 0px 8px 2px rgba(255, 230, 25, 0.25);
  border-radius: 100%;
  cursor: pointer;
}

input::-moz-range-thumb {
  width: 4px;
  height: 4px;
  border-radius: 120px;
  background: transparent;
  cursor: pointer;
}

.range-tail {
  border-radius: 120px;
  background: #ffe619;
  box-shadow: 0px 0px 8px 2px rgba(255, 230, 25, 0.25);
}

.range-container {
  border-radius: 120px;
  background: #272727;
}
</style>
