import { useFetch } from "@/composables/useFetch";
import { useAudio } from "@/composables/useAudio";
import { useToaster } from "@/composables/useToaster";
import userBalanceUpdate from "@/utils/games";

export const GAME_STATES = {
  IDLE: "IDLE",
  PROGRESS: "IN_PROGRESS",
  CASHED_OUT: "CASHED_OUT",
  FINISHED: "FINISHED",
  LOST: "LOST",
};

export const SLOT_STATES = {
  UNREVEALED: 0,
  REVEALED: 1,
  TOWER: 2,
  COIN_LATER_REVEALED: 3,
  MINE_LATER_REVEALED: 4,
};

export const DIFFICULTY_MAPS = {
  EASY_MAP: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  MEDIUM_MAP: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  HARD_MAP: [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  EXTREME_MAP: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  NIGHTMARE_MAP: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

export const defaultGameConfiguration = {
  gameId: null,
  userMap: DIFFICULTY_MAPS.EASY_MAP,
  profitSteps: [],
  activeRow: 0,
  betAmount: 1,
  profit: 0,
  multiplier: 1,
  difficulty: "EASY",
  state: GAME_STATES.IDLE,
};

export const getCurrentGame = async function () {
  let { data, error } = await useFetch("api/tower/game");

  if (!error.value && data.value.status && data.value.data) {
    return {
      ...data.value.data,
      profitSteps: data.value.data.profitSteps,
      userMap: data.value.data.userMap,
      betAmount: data.value.data.betAmount,
      activeRow: data.value.data.activeRow,
      profit: Number(data.value.data.profit) || data.value.data.betAmount,
    };
  }
  return defaultGameConfiguration;
};

export const startGame = async function (currentGame) {
  const { data, error } = await useFetch("api/tower/create", {
    method: "POST",
    body: JSON.stringify({
      betAmount: JSON.parse(currentGame.betAmount),
      difficulty: currentGame.difficulty,
    }),
  });
  if (!error.value && data.value.status) {
    let profitSteps = data.value.data.profitSteps;

    await userBalanceUpdate();
    return {
      gameId: data.value.data.gameId,
      profitSteps,
      userMap: data.value.data.userMap,
      state: GAME_STATES.PROGRESS,
      difficulty: currentGame.difficulty,
      betAmount: currentGame.betAmount,
      multiplier: profitSteps[0],
      activeRow: currentGame.activeRow,
      profit: currentGame.betAmount,
    };
  } else {
    useToaster().error(data.value.message);
  }
  return currentGame;
};

export const endGame = async function (currentGame) {
  const { data, error } = await useFetch("api/tower/cashout", {
    method: "POST",
  });
  if (!error.value && data.value.status) {
    await userBalanceUpdate();
    return resetGame(currentGame);
  } else {
    console.log(error);
    useToaster().error(data.value.message);
  }
  return currentGame;
};

export const revealSlot = async function (position, currentGame) {
  const { data, error } = await useFetch(
    "api/tower/openTile",
    {
      method: "POST",
      body: JSON.stringify({
        gameId: currentGame.gameId,
        tilePosition: position,
      }),
    },
    false
  );
  if (!data.value.status && error.value) {
    useToaster().error(data.value.message);
    return currentGame;
  }

  let state = GAME_STATES.PROGRESS;
  let revealSound = "/sounds/happy-crowd.mp3";
  let userMap = data.value.data.userMap;
  if (data.value.data.isTower) {
    revealSound = "/sounds/sad-crowd.mp3";
    state = GAME_STATES.LOST;
    userMap = syncWithBombsMap(userMap, data.value.data.generatedMap);
    await userBalanceUpdate();
  } else {
    if (data.value.data.gameOver) {
      state = GAME_STATES.FINISHED;
      userMap = syncWithBombsMap(userMap, data.value.data.generatedMap);
      await userBalanceUpdate();
    }
  }

  useAudio(revealSound);

  return {
    ...currentGame,
    userMap,
    profit: data.value.data.profit,
    multiplier: data.value.data.multiplier,
    activeRow: data.value.data.activeRow,
    state,
  };
};

function syncWithBombsMap(userMap, bombsMap) {
  bombsMap.forEach((row, rowKey) => {
    row.forEach((column, columnKey) => {
      if (
        column === SLOT_STATES.REVEALED &&
        userMap[rowKey][columnKey] === SLOT_STATES.UNREVEALED
      ) {
        userMap[rowKey][columnKey] = SLOT_STATES.COIN_LATER_REVEALED;
      } else if (
        column === SLOT_STATES.TOWER &&
        userMap[rowKey][columnKey] === SLOT_STATES.UNREVEALED
      ) {
        userMap[rowKey][columnKey] = SLOT_STATES.MINE_LATER_REVEALED;
      }
    });
  });
  return userMap;
}

export async function fetchMultipliers() {
  let { data: multipliersData, error: multipliersError } = await useFetch(
    "api/tower/multipliers"
  );

  if (!multipliersError.value) {
    return {
      easyMultipliers: Object.values(multipliersData.value.data)[0],
      mediumMultipliers: Object.values(multipliersData.value.data)[1],
      hardMultipliers: Object.values(multipliersData.value.data)[2],
      extremeMultipliers: Object.values(multipliersData.value.data)[3],
      nightmareMultipliers: Object.values(multipliersData.value.data)[4],
    };
  } else {
    console.error("Multipliers fetching error:", multipliersError.value);
    return null;
  }
}

export function resetGame(game, state = GAME_STATES.CASHED_OUT) {
  return {
    ...defaultGameConfiguration,
    difficulty: game.difficulty,
    betAmount: game.betAmount,
    state,
  };
}
