import { useAuthStore } from "@/stores/auth";
import { useToaster } from "@/composables/useToaster";

export default async function auth(to, from, next) {
  const authStore = useAuthStore();
  const user = await authStore.getUser;

  if (!user.id) {
    useToaster().warn("Not logged in");
    return next({
      name: "home",
    });
  }
  return next();
}
