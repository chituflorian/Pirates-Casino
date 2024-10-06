import { useAuthStore } from "@/stores/auth";
import { useFetch } from "@/composables/useFetch";

export default async function userBalanceUpdate() {
  const authStore = useAuthStore();
  const { data, error } = await useFetch("/api/auth/me");
  if (!error.value && data.value.status) {
    authStore.setUserBalance(data.value.data.balance);
  }
}
