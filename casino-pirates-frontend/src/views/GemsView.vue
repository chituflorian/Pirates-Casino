<script setup>
import GemsIcon from "@/assets/svg/gems/gemsFrame.svg";
import EclipseShiningButtonComponent from "@/components/general/EclipseShiningButtonComponent.vue";
import CoinIcon from "@/assets/svg/coin.svg";
import ArrowUp from "@/assets/svg/arrow-up.svg";
import EclipseButtonComponent from "@/components/general/EclipseButtonComponent.vue";
import ShiningButtonComponent from "@/components/general/ShiningButtonComponent.vue";
import OverlayPanel from "primevue/overlaypanel";
import { computed, onBeforeMount, ref } from "vue";
import InputNumber from "primevue/inputnumber";
import CardGameComponent from "@/components/layout/CardGameComponent.vue";
import { useAuthStore } from "@/stores/auth";
import { useFetch } from "@/composables/useFetch";
import { useToaster } from "@/composables/useToaster";
import GemsCardComponent from "@/components/gems/GemsCardComponent.vue";
import DisplayedGemComponent from "@/components/gems/DisplayedGemComponent.vue";
import Diamond from "@/assets/svg/gems/diamond.svg";
import DiamondOutline from "@/assets/svg/gems/diamond-outline.svg";
import DiamondBlank from "@/assets/svg/gems/diamond-blank.svg";
import ProfitIconsRender from "@/components/gems/ProfitIconsRenderer.vue";
import ProgressSpinner from "primevue/progressspinner";
import { useConfig } from "@/composables/useConfig";
import DifficultyButton from "@/components/general/DifficultyButton.vue";
import userBalanceUpdate from "@/utils/games";
import { topGems, topGemsColor } from "@/services/GemsService";
const config = useConfig("gems");
const maxAmount = config["MaxAmount"];
const minAmount = config["MinAmount"];
const gameStarted = ref(false);
const playAmount = ref(1);
const authStore = useAuthStore();
const userBalance = computed(() => authStore.getUserBalance);
const initialBet = ref([]);
const profit = ref([]);
const easyMultipliers = ref([]);
const mediumMultipliers = ref([]);
const hardMultipliers = ref([]);
const currentDifficulty = ref("EASY");
const selectedMultipliers = ref([]);
const difficultyContainer = ref();

async function startGame() {
  initialBet.value = [];

  const { data, error } = await useFetch("api/gems/create", {
    method: "POST",
    body: JSON.stringify({
      difficulty: currentDifficulty.value,
      amount: playAmount.value,
    }),
  });

  if (!error.value) {
    initialBet.value = data.value.initialBet;
    profit.value = data.value.profit.flat();

    gameStarted.value = true;
  } else {
    useToaster().error(error.value.message);
  }
}
function selectDifficulty(difficulty) {
  currentDifficulty.value = difficulty;

  switch (difficulty) {
    case "EASY":
      selectedMultipliers.value = easyMultipliers.value;
      break;
    case "MEDIUM":
      selectedMultipliers.value = mediumMultipliers.value;
      break;
    case "HARD":
      selectedMultipliers.value = hardMultipliers.value;
      break;
    default:
      selectedMultipliers.value = [];
  }
}

const determineCombination = computed(() => {
  const combination = analyzeHand(Object.values(initialBet.value));

  let cssClass = "";

  switch (combination) {
    case "Nothing":
      cssClass = "no-combination";
      break;
    case "One Pair":
      cssClass = "one-pair";
      break;
    case "Two Pair":
      cssClass = "two-pair";
      break;
    case "Three of a Kind":
      cssClass = "three-of-kind";
      break;
    case "Full House":
      cssClass = "full-house";
      break;
    case "Four of a kind":
      cssClass = "four-of-kind";
      break;
    case "Five of a kind":
      cssClass = "five-of-kind";
      break;
  }

  return cssClass;
});

const getGemComponent = (bet) => {
  return topGems[bet];
};

const getGemColor = (bet) => {
  if (profit.value.flat().includes(bet)) {
    return topGemsColor[bet];
  } else {
    return "#777777";
  }
};

function analyzeHand(hand) {
  const counts = {};
  for (const card of hand) {
    counts[card] = (counts[card] || 0) + 1;
  }

  const occurrenceCounts = Object.values(counts).sort((a, b) => b - a);

  if (occurrenceCounts[0] === 5) {
    setTimeout(async () => {
      gameStarted.value = false;
      await userBalanceUpdate();
    }, 5000);
    return "Five of a kind";
  } else if (occurrenceCounts[0] === 4 && occurrenceCounts[1] === 1) {
    setTimeout(async () => {
      gameStarted.value = false;
      await userBalanceUpdate();
    }, 1000);
    return "Four of a kind";
  } else if (occurrenceCounts[0] === 3 && occurrenceCounts[1] === 2) {
    setTimeout(async () => {
      gameStarted.value = false;
      await userBalanceUpdate();
    }, 800);
    return "Full House";
  } else if (occurrenceCounts[0] === 3) {
    setTimeout(async () => {
      gameStarted.value = false;
      await userBalanceUpdate();
    }, 600);
    return "Three of a Kind";
  } else if (occurrenceCounts[0] === 2 && occurrenceCounts[1] === 2) {
    setTimeout(async () => {
      gameStarted.value = false;
      await userBalanceUpdate();
    }, 400);
    return "Two Pair";
  } else if (occurrenceCounts[0] === 2) {
    setTimeout(async () => {
      gameStarted.value = false;
      await userBalanceUpdate();
    }, 200);
    return "One Pair";
  } else {
    setTimeout(async () => {
      gameStarted.value = false;
      await userBalanceUpdate();
    }, 0);
    return "Nothing";
  }
}

function maximizePlayAmount() {
  if (!gameStarted.value) {
    playAmount.value = Math.min(Number(userBalance.value), Number(maxAmount));
  }
}

function multiplyAmount(operator) {
  if (!gameStarted.value) {
    let newValue = Number(operator) * playAmount.value;
    playAmount.value = Math.min(
      Math.max(newValue, Number(minAmount)),
      Number(userBalance.value),
      Number(maxAmount)
    );
  }
}

onBeforeMount(async () => {
  initialBet.value = [];

  let { data: multipliersData, error: multipliersError } = await useFetch(
    "api/gems/multipliers"
  );

  if (!multipliersError.value) {
    easyMultipliers.value = Object.values(multipliersData.value)[0];
    selectedMultipliers.value = easyMultipliers.value;
    mediumMultipliers.value = Object.values(multipliersData.value)[1];
    hardMultipliers.value = Object.values(multipliersData.value)[2];
  } else {
    if (multipliersError.value) {
      console.error("Multipliers fetching error:", multipliersError.value);
    }
  }
});
</script>
<template>
  <CardGameComponent class="">
    <template #top-items>
      <GemsIcon
        class="relative z-[1] h-auto w-[130px] xl:w-[270px] xxl:w-[268px]"
      />
    </template>
    <template #content>
      <div class="flex h-full w-full flex-col gap-2 xl:gap-3 xxl:gap-4">
        <div
          id="gems-display"
          class="flex h-[54px] max-h-[78px] w-full flex-row gap-2 pb-0 md:h-[102px] md:gap-3 md:p-4 xl:gap-4 xxl:gap-5"
        >
          <DisplayedGemComponent
            v-for="(bet, index) in initialBet"
            :key="index"
            :background-color="getGemColor(bet)"
          >
            <template #Icon>
              <component
                class="h-5 w-5 md:h-8 md:w-8"
                :is="getGemComponent(bet)"
              >
              </component>
            </template>
          </DisplayedGemComponent>
        </div>
        <div
          class="relative left-0 z-[1] h-[1px] w-full bg-mine-shaft-950"
        ></div>

        <div :class="determineCombination" class="flex flex-col gap-3 md:px-4">
          <GemsCardComponent
            class="gems-row"
            :multiplier="selectedMultipliers[7]"
            :betAmount="playAmount"
          >
            <template #combination>
              <ProfitIconsRender
                class="revealed"
                :profit="Object.values(profit)"
              />
              <Diamond
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 5"
                :key="index"
              />
            </template>
          </GemsCardComponent>
          <GemsCardComponent
            class="gems-row"
            :multiplier="selectedMultipliers[6]"
            :betAmount="playAmount"
          >
            <template #combination>
              <ProfitIconsRender
                class="revealed"
                :profit="Object.values(profit)"
              />
              <Diamond
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 4"
                :key="index"
              />
              <DiamondBlank
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
              ></DiamondBlank>
            </template>
          </GemsCardComponent>
          <GemsCardComponent
            class="gems-row"
            :multiplier="selectedMultipliers[5]"
            :betAmount="playAmount"
          >
            <template #combination>
              <ProfitIconsRender
                class="revealed"
                :profit="Object.values(profit)"
              />
              <Diamond
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 3"
                :key="index"
              />
              <DiamondOutline
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 2"
                :key="index"
              />
            </template>
          </GemsCardComponent>
          <GemsCardComponent
            class="gems-row"
            :multiplier="selectedMultipliers[4]"
            :betAmount="playAmount"
          >
            <template #combination>
              <ProfitIconsRender
                class="revealed"
                :profit="Object.values(profit)"
              />
              <Diamond
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 3"
                :key="index"
              />
              <DiamondBlank
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 2"
                :key="index"
              ></DiamondBlank>
            </template>
          </GemsCardComponent>
          <GemsCardComponent
            class="gems-row"
            :multiplier="selectedMultipliers[3]"
            :betAmount="playAmount"
          >
            <template #combination>
              <ProfitIconsRender
                class="revealed"
                :profit="Object.values(profit)"
              />
              <Diamond
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 2"
                :key="index"
              />
              <DiamondOutline
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 2"
                :key="index"
              />
              <DiamondBlank class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5" />
            </template>
          </GemsCardComponent>
          <GemsCardComponent
            class="gems-row"
            :multiplier="selectedMultipliers[2]"
            :betAmount="playAmount"
          >
            <template #combination>
              <ProfitIconsRender
                class="revealed"
                :profit="Object.values(profit)"
              />
              <Diamond
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 2"
                :key="index"
              />
              <DiamondBlank
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 3"
                :key="index"
              />
            </template>
          </GemsCardComponent>
          <GemsCardComponent
            class="gems-row"
            :multiplier="selectedMultipliers[1]"
            :betAmount="playAmount"
          >
            <template #combination>
              <ProfitIconsRender
                class="revealed"
                :profit="Object.values(profit)"
              />
              <DiamondBlank
                class="no-revealed h-4 w-4 xxl:h-5 xxl:w-5"
                v-for="index in 5"
                :key="index"
              />
            </template>
          </GemsCardComponent>
        </div>

        <div class="relative z-[1] h-[1px] w-full bg-mine-shaft-950"></div>
        <div class="game-controls flex flex-col gap-3 md:px-4">
          <div class="flex gap-2 md:gap-3">
            <button
              v-if="!gameStarted"
              class="play-button h-9 flex-1 md:h-10 xxl:h-12"
              @click="startGame"
            >
              <span
                class="font-outfit-bold leading-normal text-woodsmoke-950 md:font-outfit-medium md:text-lg xxl:text-xl"
                >Play</span
              >
            </button>
            <button
              v-else
              class="play-button h-9 flex-1 md:h-10 xxl:h-12"
              disabled
            >
              <ProgressSpinner
                style="width: 30px; height: 30px"
                strokeWidth="6"
                fill="#FFE619"
                aria-label="Custom ProgressSpinner"
              />
            </button>

            <EclipseShiningButtonComponent
              :class="
                difficultyContainer?.visible
                  ? '[&_svg]:fill-turbo-400'
                  : 'hoverable [&:hover_svg]:fill-turbo-400'
              "
              class="[&_.eclipse-icon]:rounded"
              @click="(event) => difficultyContainer.toggle(event)"
            >
              <div class="flex-center aspect-square h-9 md:h-10 xxl:h-12">
                <ArrowUp class="rotate-180 fill-boulder-500" />
              </div>
            </EclipseShiningButtonComponent>
            <OverlayPanel
              unstyled
              ref="difficultyContainer"
              appendTo="body"
              :close-on-escape="true"
            >
              <div
                class="difficulty-container flex flex-col gap-3 rounded bg-woodsmoke-980 p-4"
              >
                <h2 class="font-outfit-bold text-gallery-100 xxl:text-xs">
                  Difficulty
                </h2>
                <div class="flex flex-col gap-3">
                  <DifficultyButton
                    @click="selectDifficulty('EASY')"
                    count="3"
                    :selected="currentDifficulty === 'EASY'"
                  />
                  <DifficultyButton
                    @click="selectDifficulty('MEDIUM')"
                    difficulty="medium"
                    count="2"
                    :selected="currentDifficulty === 'MEDIUM'"
                  />
                  <DifficultyButton
                    @click="selectDifficulty('HARD')"
                    difficulty="hard"
                    count="1"
                    :selected="currentDifficulty === 'HARD'"
                  />
                </div>
              </div>
            </OverlayPanel>
          </div>
          <EclipseButtonComponent
            class="flex w-full px-2.5 md:px-4 [&_.eclipse-icon]:rounded"
          >
            <div
              class="flex h-9 w-full justify-between gap-2 md:h-10 md:gap-3 xxl:h-12"
            >
              <div class="flex flex-1 items-center gap-3">
                <ShiningButtonComponent>
                  <CoinIcon class="h-6 w-6" />
                </ShiningButtonComponent>
                <InputNumber
                  unstyled
                  v-if="!gameStarted"
                  :disabled="gameStarted"
                  v-model="playAmount"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                  :min="Number(minAmount)"
                  :max="Number(maxAmount)"
                  :allow-empty="false"
                  class="relative z-[1] h-full w-full flex-1 bg-transparent focus:outline-none"
                  input-class="flex-1 h-full w-full bg-transparent focus:outline-none placeholder:text-boulder-500 text-gallery-100 text-sm md:text-base font-outfit-bold"
                />
                <span
                  class="font-outfit-bold text-sm text-gallery-100 md:text-base"
                  v-else
                  >{{ Number(playAmount).toFixed(2).toLocaleString() }}</span
                >
              </div>
              <div class="flex items-center gap-3">
                <ShiningButtonComponent
                  class="hoverable [&:hover_span]:text-turbo-400"
                  @click="multiplyAmount(1 / 2)"
                >
                  <span
                    class="font-outfit-medium text-sm text-boulder-500 md:text-base"
                    >1/2</span
                  >
                </ShiningButtonComponent>
                <ShiningButtonComponent
                  class="hoverable [&:hover_span]:text-turbo-400"
                  @click="multiplyAmount(2)"
                >
                  <span
                    class="font-outfit-medium text-sm text-boulder-500 md:text-base"
                    >2x</span
                  >
                </ShiningButtonComponent>
                <ShiningButtonComponent
                  class="[&:hover_span]:text-turbo-400"
                  @click="maximizePlayAmount"
                  :class="{ hoverable: playAmount !== userBalance }"
                >
                  <span
                    class="font-outfit-medium text-sm text-boulder-500 md:text-base"
                    :class="{
                      'text-turbo-400':
                        Number(playAmount) === Number(userBalance),
                    }"
                    >Max</span
                  >
                </ShiningButtonComponent>
              </div>
            </div>
          </EclipseButtonComponent>
        </div>
      </div>
    </template>
  </CardGameComponent>
</template>

<style lang="scss" scoped>
.selected-outline {
  border: 2px solid yellow;
  outline-offset: -2px;
}

.play-button {
  border-radius: 4px;
  background: #ffe619;
  box-shadow: 0px 0px 18px 8px #ffb42c inset,
    0px 0px 16px 2px rgba(255, 230, 25, 0.15);
  &:hover {
    box-shadow: 0px 0px 18px 8px #ffb42c inset,
      0px 0px 18px 4px rgba(255, 230, 25, 0.15);
  }
}

.no-combination,
.one-pair,
.two-pair,
.three-of-kind,
.full-house,
.four-of-kind,
.five-of-kind {
  .gems-row:nth-of-type(7) {
    animation-name: backgroundColorChange;
    animation-duration: 0.2s;
  }
}

.one-pair,
.two-pair,
.three-of-kind,
.four-of-kind,
.full-house,
.five-of-kind {
  .gems-row:nth-of-type(6) {
    animation-name: backgroundColorChange;
    animation-delay: 0.2s;
    animation-duration: 0.2s;
  }
}

.two-pair,
.three-of-kind,
.four-of-kind,
.full-house,
.five-of-kind {
  .gems-row:nth-of-type(5) {
    animation-name: backgroundColorChange;
    animation-delay: 0.4s;
    animation-duration: 0.2s;
  }
}

.three-of-kind,
.full-house,
.four-of-kind,
.five-of-kind {
  .gems-row:nth-of-type(4) {
    animation-name: backgroundColorChange;
    animation-delay: 0.6s;
    animation-duration: 0.2s;
  }
}

.full-house,
.four-of-kind,
.five-of-kind {
  .gems-row:nth-of-type(3) {
    animation-name: backgroundColorChange;
    animation-delay: 0.8s;
    animation-duration: 0.2s;
  }
}

.four-of-kind,
.five-of-kind {
  .gems-row:nth-of-type(2) {
    animation-name: backgroundColorChange;
    animation-delay: 1s;
    animation-duration: 0.2s;
  }
}

.five-of-kind {
  .gems-row:nth-of-type(1) {
    animation-name: backgroundColorChange;
    animation-delay: 1.2s;
    animation-duration: 0.2s;
  }
}

.no-combination {
  .gems-row:nth-of-type(7) {
    animation-fill-mode: forwards;
    ::v-deep .profit {
      animation-name: revealProfit;
      color: #ffe619;
    }
  }
}
.one-pair {
  .gems-row:nth-of-type(6) {
    animation-fill-mode: forwards;

    ::v-deep .profit {
      animation-name: revealProfit;
      animation-fill-mode: forwards;
      animation-delay: 0.2s;
    }

    .revealed {
      animation-name: revealGems;

      animation-fill-mode: forwards;
      animation-delay: 0.2s;
    }
  }
}

.two-pair {
  .gems-row:nth-of-type(5) {
    animation-fill-mode: forwards;

    ::v-deep .profit {
      animation-name: revealProfit;
      animation-fill-mode: forwards;
      animation-delay: 0.4s;
    }

    .revealed {
      animation-name: revealGems;

      animation-fill-mode: forwards;
      animation-delay: 0.4s;
    }
  }
}

.three-of-kind {
  .gems-row:nth-of-type(4) {
    animation-fill-mode: forwards;
    ::v-deep .profit {
      animation-name: revealProfit;
      animation-fill-mode: forwards;
      animation-delay: 0.6s;
    }
    .revealed {
      animation-name: revealGems;

      animation-fill-mode: forwards;
      animation-delay: 0.6s;
    }
  }
}

.full-house {
  .gems-row:nth-of-type(3) {
    animation-fill-mode: forwards;
    ::v-deep .profit {
      animation-name: revealProfit;
      animation-fill-mode: forwards;
      animation-delay: 0.8s;
    }
    .revealed {
      animation-name: revealGems;

      animation-fill-mode: forwards;
      animation-delay: 0.8s;
    }
  }
}

.four-of-kind {
  .gems-row:nth-of-type(2) {
    animation-fill-mode: forwards;
    ::v-deep .profit {
      animation-name: revealProfit;
      animation-fill-mode: forwards;
      animation-delay: 1s;
    }
    .revealed {
      animation-name: revealGems;
      animation-fill-mode: forwards;
      animation-delay: 1s;
    }
  }
}

.five-of-kind {
  .gems-row:nth-of-type(1) {
    animation-fill-mode: forwards;
    ::v-deep .profit {
      animation-name: revealProfit;
      animation-fill-mode: forwards;
      animation-delay: 1.2s;
    }
    .revealed {
      animation-name: revealGems;
      animation-fill-mode: forwards;
      animation-delay: 1.2s;
    }
  }
}

@keyframes backgroundColorChange {
  100% {
    border-radius: 4px;
    border: 2px solid #ffe619;
    background: #191919;
    box-shadow: 0px 0px 23px 3px #272727 inset;
  }
  0% {
    background-color: #8c8c8c;
  }
}

@keyframes revealProfit {
  0% {
    color: #8c8c8c;
  }
  100% {
    color: #ffe619;
  }
}

@keyframes revealGems {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

.revealed {
  width: 0px;
}
.no-revealed {
  width: 100%;
}

::v-deep .profit {
  color: #8c8c8c;
}
.difficulty-container {
  box-shadow: 0px 16px 94px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #282828;
}
</style>
