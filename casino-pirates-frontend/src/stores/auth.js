import { defineStore } from "pinia";
import { useCookies } from "vue3-cookies";
import { useWeb3Auth } from "@/composables/useWeb3Auth";
import { useToaster } from "@/composables/useToaster";

export const useAuthStore = defineStore({
  id: "auth",
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  getters: {
    getUserBalance: (state) => Number(state.user?.balance ?? 0),
    getUser: (state) => state.user,
    getIsAuthenticated: (state) => state.isAuthenticated,
  },
  actions: {
    logout() {
      const { cookies } = useCookies();
      cookies.remove("BEARER");
      const { disconnectWallet } = useWeb3Auth();
      disconnectWallet();
      this.user = null;
      this.isAuthenticated = false;
      useToaster().warn("You have been logged out!");
    },
    setUserBalance(newState) {
      if (this.user) {
        this.user.balance = newState;
      }
    },
    setUser(newState) {
      this.user = newState;
    },
    setIsAuthenticated(value) {
      this.isAuthenticated = value;
    },
  },
});
