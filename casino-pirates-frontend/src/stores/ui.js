import { defineStore } from "pinia";

export const useUiStore = defineStore({
  id: "ui",
  state: () => ({
    config: null,
    percentageSoundVolume: 20 / 100,
    sidebarMenuExpanded: false,
    chatSpaceExpanded: false,
  }),
  getters: {
    getPercentageSoundVolume: (state) => state.percentageSoundVolume,
    getSidebarMenuExpanded: (state) => state.sidebarMenuExpanded,
    getChatSpaceExpanded: (state) => state.chatSpaceExpanded,
    getConfig: (state) => state.config,
    getConfigOption: (state, key) => state.config[key],
  },
  actions: {
    setPercentageSoundVolume(newPercentageSoundVolume) {
      this.percentageSoundVolume = newPercentageSoundVolume;
    },
    setSidebarMenuExpanded(newState) {
      this.sidebarMenuExpanded = newState;
    },
    setChatSpaceExpanded(newState) {
      this.chatSpaceExpanded = newState;
    },
    setConfig(newState) {
      this.config = newState;
    },
  },
});
