<template>
  <div
    class="sidebar-menu flex bg-woodsmoke-960"
    :class="{
      'expanded-sidebar-menu px-3 [&_.main-menu-container>ul>li]:px-3':
        sidebarMenuExpanded,
    }"
  >
    <div class="main-menu-container relative">
      <div
        class="top-overflow-sidebar-indicator absolute left-0 right-0 top-0 z-[2] w-full"
      ></div>
      <ul
        class="menu-list relative relative flex flex-col overflow-auto py-6 [&>.main-items-separator:nth-last-of-type(1)]:hidden [&>li:first-of-type]:relative [&>li:first-of-type]:z-[3] [&>li:first-of-type]:pt-0 [&>li:nth-last-of-type(2)]:relative [&>li:nth-last-of-type(2)]:z-[3] [&>li:nth-last-of-type(2)]:pb-0"
      >
        <template
          v-for="(itemsBatch, itemsBatchKey) in menuItems"
          :key="itemsBatchKey"
        >
          <li
            v-for="(mainItem, mainItemKey) in itemsBatch"
            :key="mainItemKey"
            class="px-6 py-1.5 xl:px-6"
            :class="{ 'has-children': mainItem.childs?.length }"
          >
            <RouterLink
              v-if="typeof mainItem.navigateTo !== 'undefined'"
              :to="mainItem.navigateTo"
            >
              <MenuButtonComponent>
                <div
                  class="menu-icon-container flex aspect-square h-10 items-center p-2 xl:h-12 xl:p-2.5"
                  :class="{ active: mainItem.isActive }"
                >
                  <component :is="mainItem.icon" class="h-5 w-auto xl:h-7" />
                  <span
                    class="ml-2 hidden font-outfit-bold text-sm text-gallery-100"
                    >{{ mainItem.label }}</span
                  >
                </div>
              </MenuButtonComponent>
            </RouterLink>
            <div v-else>
              <MenuButtonComponent
                @click="
                  (e) => e.currentTarget.classList.toggle('expanded-menu-item')
                "
              >
                <div
                  class="menu-icon-container flex aspect-square h-10 items-center p-2 xl:h-12 xl:p-2.5"
                  :class="{ active: mainItem.isActive }"
                >
                  <component :is="mainItem.icon" class="h-5 w-auto xl:h-7" />
                  <span
                    class="ml-2 hidden font-outfit-bold text-sm text-gallery-100"
                    >{{ mainItem.label }}</span
                  >
                  <ArrowUp class="arrow-button ml-1 hidden rotate-180" />
                </div>
              </MenuButtonComponent>
              <ul
                v-if="mainItem.childs?.length"
                class="flex hidden flex-col gap-3 pt-3"
              >
                <li
                  v-for="(childItem, childItemKey) in mainItem.childs"
                  :key="childItemKey"
                >
                  <RouterLink
                    :to="childItem.navigateTo"
                    class="flex items-center justify-start"
                  >
                    <MenuButtonComponent>
                      <div
                        class="menu-icon-container flex aspect-square h-10 items-center p-2 xl:h-12 xl:p-2.5"
                        :class="{ active: childItem.isActive }"
                      >
                        <component
                          :is="childItem.icon"
                          class="h-5 w-auto xl:h-7"
                        />
                        <span
                          class="ml-2 hidden font-outfit-bold text-sm text-gallery-100"
                          >{{ childItem.label }}</span
                        >
                      </div>
                    </MenuButtonComponent>
                    <div class="flex-center">
                      <span
                        class="mx-3 hidden whitespace-nowrap font-outfit-medium text-white xl:text-lg"
                        >{{ childItem.label }}</span
                      >
                    </div>
                  </RouterLink>
                </li>
                <li
                  class="main-items-separator mx-auto h-[1px] w-6 bg-mine-shaft-950"
                ></li>
              </ul>
            </div>
          </li>
          <li
            class="main-items-separator mx-auto my-1.5 h-[1px] w-6 bg-mine-shaft-950"
          ></li>
        </template>
      </ul>
      <div
        class="top-overflow-sidebar-indicator absolute bottom-0 left-0 right-0 z-[2] w-full rotate-180"
      ></div>
    </div>
    <div class="secondary-menu relative h-full">
      <!--      <div-->
      <!--        class="top-overflow-sidebar-indicator absolute z-[2] top-0 left-0 right-0 w-full"-->
      <!--      ></div>-->
      <template
        v-for="(itemsBatch, itemsBatchKey) in menuItems"
        :key="itemsBatchKey"
      >
        <template
          v-for="(mainItem, mainItemKey) in itemsBatch"
          :key="mainItemKey"
        >
          <ul
            v-if="mainItem.childs?.length"
            class="menu-list hidden flex-col gap-3 overflow-auto px-6 py-6 xl:p-6 [&>li:first-of-type]:relative [&>li:first-of-type]:z-[3] [&>li:last-of-type]:relative [&>li:last-of-type]:z-[3]"
            :data-submenu="`submenu-${mainItemKey + 1}`"
            :class="{ active: mainItem.isActive }"
          >
            <li
              v-for="(childItem, childItemKey) in mainItem.childs"
              :key="childItemKey"
            >
              <RouterLink
                :to="childItem.navigateTo"
                class="flex items-center justify-start"
              >
                <MenuButtonComponent>
                  <div
                    class="flex-center menu-icon-container aspect-square h-10 xl:h-12"
                    :class="{ active: childItem.isActive }"
                  >
                    <component :is="childItem.icon" class="h-5 w-auto xl:h-7" />
                  </div>
                </MenuButtonComponent>
                <div class="flex-center">
                  <span
                    class="mx-3 hidden whitespace-nowrap font-outfit-medium text-white xl:text-lg"
                    >{{ childItem.label }}</span
                  >
                </div>
              </RouterLink>
            </li>
          </ul>
        </template>
      </template>
      <!--      <div-->
      <!--        class="top-overflow-sidebar-indicator rotate-180 absolute z-[2] bottom-0 left-0 right-0 w-full"-->
      <!--      ></div>-->
    </div>
  </div>
</template>

<script setup>
import MenuButtonComponent from "@/components/general/MenuButtonComponent.vue";
import BulbIcon from "@/assets/svg/menu/bulb.svg";
import ShipIcon from "@/assets/svg/menu/ship.svg";
import ChessIcon from "@/assets/svg/menu/chess-piece.svg";
import GiftIcon from "@/assets/svg/menu/giftbox.svg";
import LibraIcon from "@/assets/svg/menu/libra.svg";
import ChatIcon from "@/assets/svg/menu/live-chat.svg";
import PirateIcon from "@/assets/svg/menu/pirate-flag.svg";
import QuestionIcon from "@/assets/svg/menu/question-mark.svg";
import RichesIcon from "@/assets/svg/menu/riches.svg";
import ScrollIcon from "@/assets/svg/menu/scroll.svg";
import TrophyIcon from "@/assets/svg/menu/trophy.svg";
import MinesIcon from "@/assets/svg/menu/mines.svg";
import GemsIcon from "@/assets/svg/menu/gems.svg";
import CrashIcon from "@/assets/svg/menu/crash.svg";
import TowerIcon from "@/assets/svg/menu/tower.svg";
import ArrowUp from "@/assets/svg/arrow-up.svg";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";

const route = useRoute();
const uiStore = useUiStore();

const routeName = computed(() => {
  return route.name;
});

const routePath = computed(() => {
  return route.path;
});

const sidebarMenuExpanded = computed(() => {
  return uiStore.getSidebarMenuExpanded;
});

const menuItems = computed(() => {
  return [
    [
      {
        icon: ShipIcon,
        isActive: routeName.value === "home",
        navigateTo: "/",
        label: "Home",
      },
      {
        icon: GiftIcon,
        isActive: routeName.value === "bonuses",
        navigateTo: "/bonuses",
        label: "Bonuses",
      },
      {
        icon: ChessIcon,
        isActive: routePath.value?.includes("/games/"),
        label: "Games",
        childs: [
          {
            icon: GemsIcon,
            isActive: routeName.value === "gems-game",
            navigateTo: "/games/gems",
            label: "Gems",
          },
          {
            icon: TowerIcon,
            isActive: routeName.value === "tower-game",
            navigateTo: "/games/tower",
            label: "Tower",
          },
          {
            icon: CrashIcon,
            isActive: routeName.value === "crash-game",
            navigateTo: "/games/crash",
            label: "Crash",
          },
          {
            icon: MinesIcon,
            isActive: routeName.value === "mines-game",
            navigateTo: "/games/mines",
            label: "Mines",
          },
        ],
      },
      {
        icon: TrophyIcon,
        isActive: routeName.value === "tournaments",
        navigateTo: "/tournaments",
        label: "Tournaments",
      },
      {
        icon: RichesIcon,
        isActive: routeName.value === "affiliate",
        navigateTo: "/affiliate",
        label: "Affiliate",
      },
    ],
    [
      {
        icon: QuestionIcon,
        isActive: routeName.value === "help-center",
        navigateTo: "/help-center",
        label: "Help center",
      },
      {
        icon: ScrollIcon,
        isActive: routeName.value === "blog",
        navigateTo: "/blog",
        label: "Blog",
      },
      {
        icon: LibraIcon,
        isActive: routeName.value === "fairness",
        navigateTo: "/fairness",
        label: "Fairness",
      },
      {
        icon: ChatIcon,
        isActive: routeName.value === "support",
        navigateTo: "/support",
        label: "Support",
      },
    ],
    [
      {
        icon: PirateIcon,
        isActive: routeName.value === "report",
        navigateTo: "/report",
        label: "Report a bug",
      },
      {
        icon: BulbIcon,
        isActive: routeName.value === "solutions",
        navigateTo: "/solutions",
        label: "Feature",
      },
    ],
  ];
});
</script>

<style scoped lang="scss">
.sidebar-menu {
  box-shadow: 0px 16px 94px 20px rgba(0, 0, 0, 0.02);
}
.secondary-menu {
  border-right: 1px solid #282828;
}
.secondary-menu .menu-list {
  border-left: 1px solid #282828;
}
.menu-list {
  position: relative;
  height: 100%;
}
.menu-icon-container.active {
  border-radius: 8px;
  background: #ffe619;
  box-shadow: 0px 0px 18px 5px #ffb42c inset,
    0px 0px 16px 2px rgba(255, 230, 25, 0.15);
}

.main-menu-container:not(:has(li.has-children:hover)):not(
    :has(~ .secondary-menu .menu-list:hover)
  )
  ~ .secondary-menu
  .menu-list.active {
  display: flex;
}

@for $i from 1 to 10 {
  .main-menu-container:has(li.has-children:nth-of-type(#{$i}):hover)
    ~ .secondary-menu
    > ul[data-submenu="submenu-#{$i}"],
  .main-menu-container ~ .secondary-menu ul.menu-list:hover {
    display: flex;
  }
}

.expanded-sidebar-menu {
  display: flex !important;
  width: var(--left-menu-width);
}

.expanded-sidebar-menu.sidebar-menu {
  border-right: 1px solid #282828;
}

.expanded-sidebar-menu .main-menu-container {
  width: 100%;
}

.expanded-sidebar-menu .secondary-menu {
  display: none;
}

.expanded-sidebar-menu .menu-icon-container {
  width: 100%;
}

.expanded-sidebar-menu .menu-icon-container span {
  display: block;
}
.expanded-sidebar-menu .menu-icon-container .arrow-button {
  display: block;
}

.expanded-sidebar-menu .menu-icon-container.active span {
  color: #151515;
}

.expanded-sidebar-menu .expanded-menu-item .arrow-button {
  transform: rotate(0);
}

.expanded-sidebar-menu .main-menu-container .expanded-menu-item ~ ul {
  display: flex;
}

.has-children .menu-icon-container:not(.active) .arrow-button {
  fill: white;
}

.top-overflow-sidebar-indicator {
  background: linear-gradient(180deg, #1a1919 14.06%, rgba(26, 25, 25, 0) 100%);
  height: 80px;
}
</style>
