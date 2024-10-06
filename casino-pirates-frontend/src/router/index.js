import { createRouter, createWebHistory } from "vue-router";
const HomeView = () => import("@/views/HomeView.vue");
const MinesView = () => import("@/views/MinesView.vue");
const GemsView = () => import("@/views/GemsView.vue");
const TowerView = () => import("@/views/TowerView.vue");
import gameStatus from "@/middleware/gameStatus";
import auth from "@/middleware/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/bonuses",
      name: "bonuses",
      component: HomeView,
    },
    {
      path: "/tournaments",
      name: "tournaments",
      component: HomeView,
    },
    {
      path: "/affiliate",
      name: "affiliate",
      component: HomeView,
    },
    {
      path: "/help-center",
      name: "help-center",
      component: HomeView,
    },
    {
      path: "/blog",
      name: "blog",
      component: HomeView,
    },
    {
      path: "/fairness",
      name: "fairness",
      component: HomeView,
    },
    {
      path: "/support",
      name: "support",
      component: HomeView,
    },
    {
      path: "/report",
      name: "report",
      component: HomeView,
    },
    {
      path: "/solutions",
      name: "solutions",
      component: HomeView,
    },
    {
      path: "/games/mines",
      name: "mines-game",
      component: MinesView,
      meta: {
        game: "mines",
      },
      beforeEnter: [gameStatus, auth],
    },
    {
      path: "/games/tower",
      name: "tower-game",
      component: TowerView,
      meta: {
        game: "tower",
      },
      beforeEnter: [gameStatus, auth],
    },
    {
      path: "/games/gems",
      name: "gems-game",
      component: GemsView,
      meta: {
        game: "gems",
      },
      beforeEnter: [gameStatus, auth],
    },
    {
      path: "/games/crash",
      name: "crash-game",
      component: HomeView,
      meta: {
        game: "crash",
      },
      beforeEnter: [gameStatus, auth],
    },
  ],
});

export default router;
