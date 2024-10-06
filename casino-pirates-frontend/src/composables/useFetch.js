import { ref, toValue } from "vue";
import { useCookies } from "vue3-cookies";
import { useAuthStore } from "@/stores/auth";
import { useToaster } from "@/composables/useToaster";

export async function useFetch(url = "", options = {}, feedback = true) {
  const data = ref(null);
  const error = ref(null);

  url = import.meta.env.VITE_API_URL + (url[0] === "/" ? "" : "/") + url;

  data.value = null;
  error.value = null;

  const urlValue = toValue(url);
  options = httpClientOptions(options);

  await fetch(urlValue, options)
    .then(async (res) => {
      data.value = await res.json();
      if (res.ok) {
        return;
      }
      let requestError = new Error(data.value.message);
      requestError.code = data.value.statusCode;
      throw requestError;
    })
    .catch((e) => {
      error.value = e;
    });

  function httpClientOptions(options) {
    options.headers = Object.assign(getDefaultHeaders(), options.headers);
    return options;
  }

  function getDefaultHeaders() {
    const { cookies } = useCookies();
    const bearer = cookies.get("BEARER");
    return bearer
      ? {
          Authorization: "Bearer " + bearer,
          "content-type": "application/json",
        }
      : { "content-type": "application/json" };
  }

  if (!error.value || !feedback) {
    return { data, error };
  } else {
    console.log("Status code catched", error.value.code);
    switch (error.value?.code) {
      case 401:
      case 419:
        useToaster().error("The server does not allow this request!");
        useAuthStore().logout();
        return {
          data: ref(null),
          error,
        };
      case 500:
        console.log("Caught 500 error");
        return {
          data: ref(null),
          error,
        };
      default:
        return { data, error };
    }
  }
}
