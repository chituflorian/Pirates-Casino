<template>
  <div class="relative flex h-full w-full flex-col">
    <HeaderComponent />
    <div class="page-container relative flex w-full flex-1">
      <SidebarComponent
        class="absolute bottom-0 left-0 top-0 z-10 hidden lg:relative lg:flex"
      />
      <main class="flex h-full flex-1 flex-col overflow-auto">
        <slot></slot>
      </main>
      <ChatComponent
        v-show="chatSpaceExpanded"
        class="absolute bottom-0 right-0 top-0 z-10 xl:relative"
      />
    </div>
    <MobileMenuComponent />
    <Toast>
      <!--      <template #container="data">-->
      <!--        <ToastComponent :data="data" />-->
      <!--      </template>-->
    </Toast>
  </div>
</template>

<script setup>
import HeaderComponent from "@/components/layout/HeaderComponent.vue";
import SidebarComponent from "@/components/layout/SidebarComponent.vue";
import ChatComponent from "@/components/layout/ChatComponent.vue";
import { computed } from "vue";
import { useUiStore } from "@/stores/ui";
import MobileMenuComponent from "@/components/layout/MobileMenuComponent.vue";

const uiStore = useUiStore();
const chatSpaceExpanded = computed(() => {
  return uiStore.getChatSpaceExpanded;
});
</script>

<style scoped></style>
