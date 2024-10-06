import { appPromise } from "@/main";

export function useToaster() {
  const getToast = async () => {
    const app = await appPromise;
    return app.config.globalProperties.$toast;
  };

  const success = (message) => {
    getToast().then((data) =>
      data.add({
        severity: "success",
        summary: "Success message",
        detail: message,
        life: 3000,
      })
    );
  };

  const info = (message) => {
    getToast().then((data) =>
      data.add({
        severity: "info",
        summary: "Info message",
        detail: message,
        life: 3000,
      })
    );
  };

  const warn = (message) => {
    getToast().then((data) =>
      data.add({
        severity: "warn",
        summary: "Warning message",
        detail: message,
        life: 3000,
      })
    );
  };

  const error = (message) => {
    getToast().then((data) =>
      data.add({
        severity: "error",
        summary: "Error message",
        detail: message,
        life: 3000,
      })
    );
  };
  return {
    success,
    error,
    warn,
    info,
  };
}
