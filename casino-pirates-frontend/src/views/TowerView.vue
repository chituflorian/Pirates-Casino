<script setup>
import TreasureIcon from "@/assets/svg/mines/treasure.svg";
import SkullIcon from "@/assets/svg/mines/skull.svg";
import KnifeIcon from "@/assets/svg/mines/knife.svg";
import EclipseShiningButtonComponent from "@/components/general/EclipseShiningButtonComponent.vue";
import CoinIcon from "@/assets/svg/coin.svg";
import MinesCoinIcon from "@/assets/svg/mines/coin.svg";
import RedSkullIcon from "@/assets/svg/tower/red-skull.svg";
import ArrowUp from "@/assets/svg/arrow-up.svg";
import EclipseButtonComponent from "@/components/general/EclipseButtonComponent.vue";
import ShiningButtonComponent from "@/components/general/ShiningButtonComponent.vue";
import OverlayPanel from "primevue/overlaypanel";
import { computed, onBeforeMount, ref } from "vue";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import CardGameComponent from "@/components/layout/CardGameComponent.vue";
import { useAuthStore } from "@/stores/auth";
import TowerCardComponent from "@/components/tower/TowerCardComponent.vue";
import BomberIcon from "@/assets/svg/mines/bomber.svg";
import DifficultyButton from "@/components/general/DifficultyButton.vue";

import {
  defaultGameConfiguration,
  GAME_STATES,
  SLOT_STATES,
  getCurrentGame,
  revealSlot,
  startGame,
  endGame,
  DIFFICULTY_MAPS,
  fetchMultipliers,
} from "@/services/TowerService";
import { useConfig } from "@/composables/useConfig";

const config = useConfig("tower");
const maxAmount = config["MaxAmount"];
const minAmount = config["MinAmount"];
const currentDifficulty = ref("EASY");
const easyMultipliers = ref([]);
const mediumMultipliers = ref([]);
const hardMultipliers = ref([]);
const extremeMultipliers = ref([]);
const nightmareMultipliers = ref([]);
const selectedMultipliers = ref([]);
const currentGame = ref(defaultGameConfiguration);
const activeRow = ref(-1);
const unsafeNumber = ref(1);
const safeNumber = ref(3);

const gameStarted = computed(
  () =>
    !!currentGame.value?.gameId &&
    currentGame.value?.state === GAME_STATES.PROGRESS
);
const gameEnded = computed(
  () =>
    !!currentGame.value?.gameId &&
    (currentGame.value?.state === GAME_STATES.LOST ||
      currentGame.value?.state === GAME_STATES.FINISHED ||
      currentGame.value?.state === GAME_STATES.CASHED_OUT)
);
const difficultyContainer = ref();

const authStore = useAuthStore();
const userBalance = computed(() => authStore.getUserBalance);
const maxBet = computed(() =>
  Math.min(Number(userBalance.value), Number(maxAmount))
);

async function revealSlotAction(position, rowKey) {
  if (rowKey !== activeRow.value) return;
  if (gameStarted.value && currentGame.value.gameId) {
    currentGame.value = await revealSlot(position, currentGame.value);
    activeRow.value = currentGame.value.activeRow;
    // if (rowKey === 0) activeRow.value = 1;
    if (currentGame.value.state === GAME_STATES.LOST) {
      currentGame.value.userMap[activeRow][position] = SLOT_STATES.TOWER;
    }
  }
}

function multiplyAmount(operator) {
  if (!gameStarted.value) {
    let newValue = Number(operator) * currentGame.value.betAmount;
    currentGame.value.betAmount = Math.min(
      Math.max(newValue, Number(minAmount)),
      Number(userBalance.value),
      Number(maxAmount)
    );
  }
}

function maximizePlayAmount() {
  if (!gameStarted.value) {
    currentGame.value.betAmount = Math.min(
      Number(userBalance.value),
      Number(maxAmount)
    );
  }
}

function selectDifficulty(difficulty) {
  currentDifficulty.value = difficulty;

  switch (difficulty) {
    case "EASY":
      currentGame.value.difficulty = "EASY";
      currentGame.value.userMap = DIFFICULTY_MAPS.EASY_MAP;
      safeNumber.value = 3;
      unsafeNumber.value = 1;
      selectedMultipliers.value = [...easyMultipliers.value].reverse();
      // activeRow.value = currentGame.value.userMap.length - 1;
      break;
    case "MEDIUM":
      currentGame.value.difficulty = "MEDIUM";
      currentGame.value.userMap = DIFFICULTY_MAPS.MEDIUM_MAP;
      safeNumber.value = 2;
      unsafeNumber.value = 1;
      selectedMultipliers.value = [...mediumMultipliers.value].reverse();
      // activeRow.value = currentGame.value.userMap.length - 1;
      break;
    case "HARD":
      currentGame.value.difficulty = "HARD";
      currentGame.value.userMap = DIFFICULTY_MAPS.HARD_MAP;
      safeNumber.value = 1;
      unsafeNumber.value = 1;
      selectedMultipliers.value = [...hardMultipliers.value].reverse();
      // activeRow.value = currentGame.value.userMap.length - 1;
      break;
    case "EXTREME":
      currentGame.value.difficulty = "EXTREME";
      currentGame.value.userMap = DIFFICULTY_MAPS.EXTREME_MAP;
      safeNumber.value = 1;
      unsafeNumber.value = 2;
      selectedMultipliers.value = [...extremeMultipliers.value].reverse();
      // activeRow.value = currentGame.value.userMap.length - 1;
      break;
    case "NIGHTMARE":
      currentGame.value.difficulty = "NIGHTMARE";
      currentGame.value.userMap = DIFFICULTY_MAPS.NIGHTMARE_MAP;
      safeNumber.value = 1;
      unsafeNumber.value = 3;
      selectedMultipliers.value = [...nightmareMultipliers.value].reverse();
      // activeRow.value = currentGame.value.userMap.length - 1;
      break;
    default:
      selectedMultipliers.value = [];
  }
}

async function startGameAction() {
  if (!gameStarted.value) {
    currentGame.value = await startGame(currentGame.value);
    currentGame.value.activeRow = currentGame.value.userMap.length - 1;
    activeRow.value = currentGame.value.activeRow;
  }
}

async function endGameAction() {
  currentGame.value = await endGame(currentGame.value);
  console.log(currentGame.value, "ssss");
  // if (currentGame.value.activeRow === 0)
  //   activeRow.value = currentGame.value.userMap.length - 1;
}

onBeforeMount(async () => {
  currentGame.value = await getCurrentGame();
  currentDifficulty.value = currentGame.value.difficulty;
  if (!currentGame.value.activeRow) {
    currentGame.value.activeRow = currentGame.value.userMap.length - 1;
    activeRow.value = currentGame.value.userMap.length - 1;
  } else if (
    currentGame.value.userMap.length - 1 ===
    currentGame.value.activeRow
  )
    activeRow.value = currentGame.value.activeRow;
  else activeRow.value = currentGame.value.activeRow - 1;

  const multipliers = await fetchMultipliers();

  if (multipliers) {
    easyMultipliers.value = multipliers.easyMultipliers;
    selectedMultipliers.value = [...easyMultipliers.value].reverse();
    mediumMultipliers.value = multipliers.mediumMultipliers;
    hardMultipliers.value = multipliers.hardMultipliers;
    extremeMultipliers.value = multipliers.extremeMultipliers;
    nightmareMultipliers.value = multipliers.nightmareMultipliers;
  }
});
</script>

<template>
  <CardGameComponent
    :class="{ 'game-started': gameStarted, 'game-ended': gameEnded }"
  >
    <template #before>
      <div
        class="win-slot md:flex-center hidden h-fit w-fit gap-3 rounded-lg md:px-[30px] md:py-4 xxl:px-[53px] xxl:py-6"
      >
        <MinesCoinIcon class="h-6 w-auto xxl:h-8" />
        <span
          class="w-[2ch] font-outfit-bold text-woodsmoke-950 md:text-lg xl:text-xl xxl:text-2xl"
          >{{ safeNumber }}</span
        >
      </div>
    </template>
    <template #top-items>
      <SkullIcon
        class="h-[25px] w-auto -translate-y-5 translate-x-[95%] md:-translate-y-8 md:translate-x-[80%] xl:h-[50px]"
      />
      <TreasureIcon
        class="relative z-[1] h-auto w-[130px] xl:w-[200px] xxl:w-[235px]"
      />
      <KnifeIcon
        class="h-[80px] w-auto -translate-x-1/2 -translate-y-2.5 md:-translate-y-[18px] xl:h-[142px] xxl:h-[162px]"
      />
    </template>
    <template #content>
      <div class="flex h-[60vh] min-h-[493px] w-full flex-col md:h-full">
        <div
          :class="{
            'grid-cols-4  grid-rows-9': currentDifficulty === 'EASY',
            'grid-cols-3  grid-rows-9': currentDifficulty === 'MEDIUM',
            'grid-cols-2  grid-rows-9': currentDifficulty === 'HARD',
            'grid-cols-3  grid-rows-6': currentDifficulty === 'EXTREME',
            'grid-cols-4  grid-rows-6': currentDifficulty === 'NIGHTMARE',
          }"
          class="relative z-[1] grid h-fit w-full flex-1 gap-2 bg-woodsmoke-950 pb-0 md:gap-4 md:bg-[unset] md:p-4"
        >
          <template
            v-for="(row, rowKey) in currentGame.userMap"
            :key="`row-${rowKey}`"
          >
            <template
              v-for="(column, columnKey) in row"
              :key="`slot-${rowKey}-${columnKey}`"
            >
              <div
                :class="{
                  'active-row': rowKey === activeRow && gameStarted,
                  revealed: column !== SLOT_STATES.UNREVEALED,
                  'later-revealed':
                    column === SLOT_STATES.COIN_LATER_REVEALED ||
                    column === SLOT_STATES.MINE_LATER_REVEALED,
                }"
                class="flip-card-inner flex-center relative h-full w-full bg-woodsmoke-980"
              >
                <div
                  :class="{}"
                  class="flip-card-front flex-center h-full w-full"
                >
                  <TowerCardComponent
                    @click="revealSlotAction(columnKey, activeRow)"
                    :multiplier="selectedMultipliers[rowKey]"
                  />
                </div>
                <div
                  v-if="
                    column === SLOT_STATES.REVEALED ||
                    column === SLOT_STATES.COIN_LATER_REVEALED
                  "
                  class="flip-card-back win-slot flex-center relative aspect-square h-full w-full"
                >
                  <MinesCoinIcon class="h-4 w-auto xxl:h-6" />
                </div>
                <div
                  v-if="
                    column === SLOT_STATES.TOWER ||
                    column === SLOT_STATES.MINE_LATER_REVEALED
                  "
                  class="flip-card-back lose-slot flex-center relative aspect-square h-full w-full"
                >
                  <RedSkullIcon class="h-4 w-auto xxl:h-6" />
                </div>
                <div
                  v-if="column === SLOT_STATES.UNREVEALED"
                  class="flip-card-back h-full w-full"
                >
                  <TowerCardComponent />
                </div>
              </div>
            </template>
          </template>
        </div>
        <div class="mt-3 flex gap-2 md:hidden">
          <div class="flex-center win-slot flex-1 gap-2 rounded py-2.5">
            <MinesCoinIcon class="h-5 w-auto" />
            <span
              class="w-[2ch] font-outfit-bold text-woodsmoke-950 md:font-outfit-medium"
              >{{ safeNumber }}</span
            >
          </div>
          <div class="flex-center lose-slot flex-1 gap-2 rounded py-2.5">
            <BomberIcon class="h-6 w-auto" />
            <span
              class="w-[2ch] font-outfit-bold text-woodsmoke-950 md:font-outfit-medium"
              >{{ unsafeNumber }}</span
            >
          </div>
        </div>
        <div class="flex flex-col">
          <div
            class="relative z-[1] my-3 h-[1px] w-full bg-mine-shaft-950 md:my-0"
          ></div>
          <div class="game-controls flex flex-col gap-3 md:p-4">
            <div class="flex gap-2 md:gap-3">
              <button
                v-if="!gameStarted"
                class="play-button h-9 flex-1 md:h-10 xxl:h-12"
                @click="startGameAction"
              >
                <span
                  class="font-outfit-semibold leading-normal text-woodsmoke-950 md:font-outfit-medium md:text-lg xxl:text-xl"
                  >Play</span
                >
              </button>
              <EclipseButtonComponent
                v-else
                class="hoverable w-full [&_.eclipse-icon]:rounded"
              >
                <div
                  class="flex-center h-9 flex-1 md:h-10 xxl:h-12"
                  @click="endGameAction"
                >
                  <span
                    class="flex-center flex-nowrap whitespace-nowrap font-outfit-semibold text-lg leading-normal text-gallery-100 md:font-outfit-medium xxl:text-xl"
                    >Cash out
                    <span
                      v-if="Number(currentGame.profit)"
                      class="flex-center ml-2 flex-nowrap"
                    >
                      <ShiningButtonComponent>
                        <CoinIcon class="h-6 w-6" />
                      </ShiningButtonComponent>
                      <span class="ml-2 text-base">
                        {{ Number(currentGame.profit).toLocaleString() }}
                      </span>
                    </span>
                  </span>
                </div>
              </EclipseButtonComponent>
              <button
                class="inline"
                v-tooltip.focus.top="gameStarted ? 'Game in progress' : null"
              >
                <EclipseShiningButtonComponent
                  :class="
                    difficultyContainer?.visible
                      ? '[&_svg]:fill-turbo-400'
                      : 'hoverable [&:hover_svg]:fill-turbo-400'
                  "
                  class="[&_.eclipse-icon]:rounded"
                  @click="
                    (event) => {
                      difficultyContainer.toggle(event);
                    }
                  "
                >
                  <div class="flex-center aspect-square h-9 md:h-10 xxl:h-12">
                    <ArrowUp class="rotate-180 fill-boulder-500" />
                  </div>
                </EclipseShiningButtonComponent>
              </button>

              <OverlayPanel
                v-if="!gameStarted"
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
                      @click="selectDifficulty('NIGHTMARE')"
                      difficulty="nightmare"
                      count="1"
                      :selected="currentDifficulty === 'NIGHTMARE'"
                    />
                    <DifficultyButton
                      @click="selectDifficulty('EXTREME')"
                      difficulty="extreme"
                      count="1"
                      :selected="currentDifficulty === 'EXTREME'"
                    />
                    <DifficultyButton
                      @click="selectDifficulty('HARD')"
                      difficulty="hard"
                      count="1"
                      :selected="currentDifficulty === 'HARD'"
                    />
                    <DifficultyButton
                      @click="selectDifficulty('MEDIUM')"
                      difficulty="medium"
                      count="2"
                      :selected="currentDifficulty === 'MEDIUM'"
                    />
                    <DifficultyButton
                      @click="selectDifficulty('EASY')"
                      count="3"
                      :selected="currentDifficulty === 'EASY'"
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
                <Button
                  class="flex flex-1 items-center gap-3"
                  v-tooltip.focus.top="gameStarted ? 'Game in progress' : null"
                >
                  <ShiningButtonComponent>
                    <CoinIcon class="h-6 w-6" />
                  </ShiningButtonComponent>
                  <InputNumber
                    unstyled
                    v-if="!gameStarted"
                    :disabled="gameStarted"
                    v-model="currentGame.betAmount"
                    inputId="locale-user"
                    :minFractionDigits="2"
                    :maxFractionDigits="2"
                    :min="Number(minAmount)"
                    :max="maxBet"
                    :allow-empty="false"
                    class="relative z-[1] h-full w-full flex-1 bg-transparent focus:outline-none"
                    input-class="flex-1 h-full w-full bg-transparent focus:outline-none placeholder:text-boulder-500 text-gallery-100 text-sm md:text-base font-outfit-bold"
                  />
                  <span
                    class="font-outfit-bold text-sm text-gallery-100 md:text-base"
                    v-else
                    >{{ Number(currentGame.betAmount).toLocaleString() }}</span
                  >
                </Button>
                <div class="flex items-center gap-3">
                  <ShiningButtonComponent
                    class="hoverable [&:hover_button]:text-turbo-400"
                    @click="multiplyAmount(1 / 2)"
                  >
                    <Button
                      v-tooltip.focus.top="
                        gameStarted ? 'Game in progress' : null
                      "
                      class="font-outfit-medium text-sm text-boulder-500 md:text-base"
                      >1/2</Button
                    >
                  </ShiningButtonComponent>
                  <ShiningButtonComponent
                    class="hoverable [&:hover_button]:text-turbo-400"
                    @click="multiplyAmount(2)"
                  >
                    <Button
                      v-tooltip.focus.top="
                        gameStarted ? 'Game in progress' : null
                      "
                      class="font-outfit-medium text-sm text-boulder-500 md:text-base"
                      >2x</Button
                    >
                  </ShiningButtonComponent>
                  <ShiningButtonComponent
                    class="[&:hover_button]:text-turbo-400"
                    @click="maximizePlayAmount"
                    :class="{
                      hoverable:
                        Number(currentGame.betAmount) !== Number(maxBet),
                    }"
                  >
                    <Button
                      v-tooltip.focus.top="
                        gameStarted ? 'Game in progress' : null
                      "
                      class="font-outfit-medium text-sm text-boulder-500 md:text-base"
                      :class="{
                        'text-turbo-400':
                          Number(currentGame.betAmount) === Number(maxBet),
                      }"
                      >Max</Button
                    >
                  </ShiningButtonComponent>
                </div>
              </div>
            </EclipseButtonComponent>
          </div>
        </div>
      </div>
    </template>
    <template #after>
      <div
        class="lose-slot md:flex-center hidden h-fit w-fit gap-3 rounded-lg md:px-[30px] md:py-4 xxl:px-[53px] xxl:py-6"
      >
        <RedSkullIcon class="h-8 w-auto xxl:h-10" />
        <span
          class="w-[2ch] font-outfit-bold text-woodsmoke-950 md:text-lg xl:text-xl xxl:text-2xl"
          >{{ unsafeNumber }}</span
        >
      </div>
    </template>
  </CardGameComponent>
</template>

<style lang="scss" scoped>
.game-container {
  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    &.active-row {
      cursor: pointer;
      :hover ::v-deep .active {
        color: #ffe619;
        border-color: #ffe619;
      }
    }

    &:not(.active-row) {
      opacity: 0.5;
      cursor: default;
      pointer-events: none;
      opacity: 0.5;
    }
  }

  .flip-card-front,
  .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .flip-card-back {
    visibility: hidden;
  }
}

.game-started,
.game-ended {
  .game-container {
    .flip-card-front,
    .flip-card-back {
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
    }
    .flip-card-back {
      visibility: unset;
    }
    .revealed.flip-card-inner {
      transform: rotateY(180deg);
      opacity: 1;
    }
    .flip-card-back {
      transform: rotateY(180deg);
    }
    .later-revealed .flip-card-back {
      opacity: 0.3;
    }
  }
}

.game-started {
  .game-container {
    .flip-card-front {
      .card-container {
        @apply cursor-pointer;
        &:hover {
          fill: #191919;
          box-shadow: 0 0 23px 3px #272727 inset;
          > div:not(.card-center-mark) {
            @apply border-turbo-400;
          }
        }
      }
    }
  }
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
.win-slot {
  background: #ffe619;
  box-shadow: 0px 0px 18px 8px #ffb42c inset,
    0px 0px 16px 2px rgba(255, 230, 25, 0.15);
}
.lose-slot {
  background: #fb2626;
  box-shadow: 0px 0px 18px 8px #801313 inset,
    0px 0px 16px 2px rgba(251, 38, 38, 0.15);
}

.difficulty-container {
  box-shadow: 0px 16px 94px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #282828;
}
</style>
