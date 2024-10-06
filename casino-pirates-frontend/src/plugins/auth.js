import { useFetch } from "@/composables/useFetch";
import { useAuthStore } from "@/stores/auth";
import { useWeb3Auth } from "@/composables/useWeb3Auth";

export default {
  install: () => {
    const { isConnected, disconnectWallet } = useWeb3Auth();
    return useFetch("/api/auth/me", {}, false).then(({ data, error }) => {
      // If the user is authenticated in backend
      if (!error.value && data.value.status) {
        const authStore = useAuthStore();
        // if the user is not connected with wallet connect and is connected in backend -> need to log in again
        if (!isConnected) {
          authStore.logout();
        } else {
          authStore.setUser(data.value.data);
          authStore.setIsAuthenticated(true);
        }
      } else {
        // if the user is connected with wallet connect and not connected in backend -> need to log in again
        if (isConnected) {
          disconnectWallet();
        }
      }
    });
  },
};
