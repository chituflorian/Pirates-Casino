import { useConfig } from "@/composables/useConfig";
import { useToaster } from "@/composables/useToaster";

export default async function gameStatus(to, from, next) {
  let label = to.meta.game;
  if (!label) {
    console.log("FIRST HERE");
    useToaster().warn("Not authenticated");
    return next({
      name: "home",
    });
  }
  const config = useConfig(label);
  if (!config) {
    console.log("SECOND HERE");
    useToaster().warn("Not authenticated");
    return next({
      name: "home",
    });
  }
  if (!config["Status"]) {
    useToaster().warn("Game under construction");
    return next({
      name: "home",
    });
  }
  return next();
}
