import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import customization from "@/utils/primevue";

import App from "./App.vue";
import router from "./router";
import config from "./plugins/config";
import auth from "./plugins/auth";
import web3auth from "./plugins/web3auth";

import "./assets/main.css";
import Tooltip from "primevue/tooltip";

async function initializeApp() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  await web3auth.install(app, { pinia });
  await config.install(app, { pinia });
  await auth.install(app, { pinia });
  app.use(router);
  app.use(PrimeVue, {
    unstyled: true,
    pt: customization,
  });

  // eslint-disable-next-line vue/multi-word-component-names
  app.component("Toast", Toast);
  app.use(ToastService);
  app.use(ConfirmationService);
  app.directive("tooltip", Tooltip);

  app.mount("#app");

  return app;
}

const appPromise = initializeApp();

export { appPromise };
