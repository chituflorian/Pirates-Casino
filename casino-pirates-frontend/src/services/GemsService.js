import { useFetch } from "@/composables/useFetch";
import { useToaster } from "@/composables/useToaster";
import userBalanceUpdate from "@/utils/games";
import PurpleGemIcon from "@/assets/svg/gems/purple-gem.svg";
import RedGemIcon from "@/assets/svg/gems/red-gem.svg";
import GreenGemIcon from "@/assets/svg/gems/green-gem.svg";
import GreenDiamondIcon from "@/assets/svg/gems/green-diamond.svg";
import BlueGemIcon from "@/assets/svg/gems/blue-gem.svg";
import YellowDiamond from "@/assets/svg/gems/yellow-diamond.svg";
import RedDiamond from "@/assets/svg/gems/red-diamond.svg";

export const defaultGameConfiguration = {
  generatedGems: '["c","b","g","f","e"]',
  prize: 0,
  betAmount: 1,
  profit: 0,
  multiplier: 1,
  difficulty: "EASY",
};

export const topGems = {
  a: RedGemIcon,
  b: GreenGemIcon,
  c: BlueGemIcon,
  d: PurpleGemIcon,
  e: GreenDiamondIcon,
  f: YellowDiamond,
  g: RedDiamond,
};

export const topGemsColor = {
  a: "#FE6A2E",
  b: "#56FFD6",
  c: "#0096DC",
  d: "#A3BAFF",
  e: "#16CCCA",
  f: "#FFE465",
  g: "#FE6991",
};

// export const getCurrentGame = async function () {
//   let { data, error } = await useFetch("api/gems/game");
//   if (!error.value && data.value.success) {
//     return {
//       ...data.value.game,
//       prize: JSON.parse(data.value.game.prize),
//       generatedGems: JSON.parse(data.value.game.generatedGems),
//       betAmount: JSON.parse(data.value.game.betAmount),
//       difficulty: JSON.parse(data.value.game.difficulty),
//       profit: Number(data.value.game.profit),
//     };
//   }
//   return defaultGameConfiguration;
// };

// export const startGame = async function (currentGame) {
//   const { data, error } = await useFetch("api/mines/create", {
//     method: "POST",
//     body: JSON.stringify({
//       difficulty: currentGame.difficulty,
//       amount: currentGame.betAmount,
//     }),
//   });
//   if (!error.value && data.value.success) {
//     let initialBet = JSON.parse(data.value.initialBet);
//     await userBalanceUpdate();
//     return {
//       generatedGems: initialBet,
//       betAmount: currentGame.betAmount,
//       multiplier: profitSteps[0],
//       profit: currentGame.betAmount,
//     };
//   } else {
//     useToaster().error(error.value.message);
//   }
//   return currentGame;
// };
