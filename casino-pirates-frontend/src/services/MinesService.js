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
  MINE: 2,
  COIN_LATER_REVEALED: 3,
  MINE_LATER_REVEALED: 4,
};

export const defaultGameConfiguration = {
  gameId: null,
  userMap: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  profitSteps: [],
  mines: 3,
  tilesOpened: 0,
  betAmount: 1,
  profit: 0,
  multiplier: 1,
  state: GAME_STATES.IDLE,
};

export const getCurrentGame = async function () {
  let { data, error } = await useFetch("api/mines/game");
  if (!error.value && data.value.status) {
    let gameData = data.value.data;
    if (gameData.gameId) {
      return {
        ...gameData,
        profitSteps: gameData.profitSteps,
        userMap: gameData.userMap,
        betAmount: gameData.betAmount,
        profit: Number(gameData.profit) || gameData.betAmount,
      };
    }
  }
  return defaultGameConfiguration;
};

export const startGame = async function (currentGame) {
  const { data, error } = await useFetch("api/mines/create", {
    method: "POST",
    body: JSON.stringify({
      amount: Number(currentGame.betAmount),
      mines: Number(currentGame.mines),
    }),
  });
  if (!error.value && data.value.status) {
    let gameData = data.value.data;
    await userBalanceUpdate();
    return {
      gameId: gameData.gameId,
      profitSteps: gameData.profitSteps,
      userMap: gameData.userMap,
      state: GAME_STATES.PROGRESS,
      mines: currentGame.mines,
      betAmount: currentGame.betAmount,
      multiplier: gameData.profitSteps[0],
      profit: currentGame.betAmount,
    };
  } else {
    useToaster().error(data.value?.message || error.value?.message || "");
  }
  return currentGame;
};

export const endGame = async function (currentGame) {
  const { data, error } = await useFetch("api/mines/cashout", {
    method: "POST",
  });
  if (!error.value && data.value.status) {
    await userBalanceUpdate();
    return resetGame(currentGame);
  } else {
    useToaster().error(data.value?.message || error.value?.message || "");
  }
  return currentGame;
};

export const revealSlot = async function (xPosition, yPosition, currentGame) {
  const { data, error } = await useFetch(
    "api/mines/tile",
    {
      method: "POST",
      body: JSON.stringify({
        gameId: currentGame.gameId,
        x: xPosition,
        y: yPosition,
      }),
    },
    false
  );
  if (error.value || !data.value.status) {
    useToaster().error(data.value?.message || error.value?.message || "");
    return currentGame;
  }

  let gameData = data.value.data;

  let state = GAME_STATES.PROGRESS;
  let revealSound = "/sounds/happy-crowd.mp3";
  let userMap = gameData.userMap;
  if (gameData.isMine) {
    revealSound = "/sounds/sad-crowd.mp3";
    state = GAME_STATES.LOST;
    userMap = syncWithBombsMap(userMap, gameData.generatedMap);
    await userBalanceUpdate();
  } else {
    if (gameData.lastTile) {
      state = GAME_STATES.FINISHED;
      userMap = syncWithBombsMap(userMap, gameData.generatedMap);
      await userBalanceUpdate();
    }
  }

  useAudio(revealSound);

  return {
    ...currentGame,
    userMap,
    profit: gameData.profit,
    multiplier: gameData.multiplier,
    state,
  };
};

function syncWithBombsMap(userMap, bombsMap) {
  bombsMap.forEach((row, rowKey) => {
    row.forEach((column, columnKey) => {
      if (
        column === SLOT_STATES.UNREVEALED &&
        userMap[rowKey][columnKey] === SLOT_STATES.UNREVEALED
      ) {
        userMap[rowKey][columnKey] = SLOT_STATES.COIN_LATER_REVEALED;
      } else if (
        column === SLOT_STATES.REVEALED &&
        userMap[rowKey][columnKey] === SLOT_STATES.UNREVEALED
      ) {
        userMap[rowKey][columnKey] = SLOT_STATES.MINE_LATER_REVEALED;
      }
    });
  });
  return userMap;
}

export function resetGame(game, state = GAME_STATES.CASHED_OUT) {
  return {
    ...defaultGameConfiguration,
    mines: game.mines,
    betAmount: game.betAmount,
    state,
  };
}
