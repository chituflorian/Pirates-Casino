<template>
  <nav
    class="navigation-container relative flex items-center justify-between p-3 md:hidden md:px-6 md:py-3 xxl:py-5"
  >
    <EclipseShiningButtonComponent
      :class="{ 'no-shine': !sidebarMenuExpanded }"
      @click="toggleSidebarMenuExpandedState"
    >
      <div class="flex items-center p-2">
        <BurgerIcon
          class="messages-icon aspect-square h-5 fill-boulder-500 md:h-6 xxl:h-7"
        />
      </div>
    </EclipseShiningButtonComponent>
    <EclipseButtonComponent v-if="!isAuthenticated" class="!cursor-default">
      <div class="flex items-center gap-4">
        <ShiningButtonComponent class="ml-3">
          <CoinIcon class="h-4 w-4 md:h-5 md:w-5" />
        </ShiningButtonComponent>
        <div class="flex items-center">
          <span
            class="min-w-[5ch] font-outfit-semibold text-sm text-white xxl:text-base"
            >{{ userBalance.toLocaleString() }}</span
          >
        </div>
        <button
          class="flex-center add-button aspect-square h-9 rounded-full bg-turbo-400 xxl:h-10"
        >
          <PlusIcon class="aspect-square h-5 xxl:h-6" />
        </button>
      </div>
    </EclipseButtonComponent>
    <EclipseShiningButtonComponent
      :class="{ 'no-shine': !chatSpaceExpanded }"
      @click="toggleChatSpaceExpandedState"
    >
      <div class="flex-center aspect-square h-9 md:h-10 xxl:h-12">
        <MessagesIcon
          class="messages-icon aspect-square h-5 fill-boulder-500"
        />
      </div>
    </EclipseShiningButtonComponent>
  </nav>
</template>

<script setup>
import { useUiStore } from "@/stores/ui";
import BurgerIcon from "@/assets/svg/burger-menu.svg";
import MessagesIcon from "@/assets/svg/messages.svg";
import CoinIcon from "@/assets/svg/coin.svg";
import PlusIcon from "@/assets/svg/plus.svg";
import EclipseButtonComponent from "@/components/general/EclipseButtonComponent.vue";
import EclipseShiningButtonComponent from "@/components/general/EclipseShiningButtonComponent.vue";
import ShiningButtonComponent from "@/components/general/ShiningButtonComponent.vue";
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";

const uiStore = useUiStore();
const authStore = useAuthStore();
const userBalance = computed(() => authStore.getUserBalance);
const chatSpaceExpanded = computed(() => uiStore.getChatSpaceExpanded);
const sidebarMenuExpanded = computed(() => uiStore.getSidebarMenuExpanded);
const isAuthenticated = computed(() => authStore.getIsAuthenticated);
function toggleSidebarMenuExpandedState(e) {
  e.currentTarget.classList.toggle("no-shine");
  uiStore.setSidebarMenuExpanded(!uiStore.getSidebarMenuExpanded);
}
function toggleChatSpaceExpandedState(e) {
  e.currentTarget.classList.toggle("no-shine");
  uiStore.setChatSpaceExpanded(!uiStore.getChatSpaceExpanded);
}
</script>

<style scoped>
.navigation-container {
  border: 1px solid #282828;
  background: #1a1919;
  box-shadow: 0px 16px 94px 20px rgba(0, 0, 0, 0.02);
}

.add-button {
  box-shadow: 0px 0px 12px 4px #ffb42c inset;
}

.messages-icon {
  fill: #ffe619;
}
.no-shine .messages-icon {
  fill: #777777;
}
</style>
