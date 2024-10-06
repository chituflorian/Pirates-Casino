<script setup>
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AudioComponent from "@/components/general/AudioComponent.vue";
import { useWeb3Auth } from "@/composables/useWeb3Auth";
import { watch } from "vue";
import { useFetch } from "@/composables/useFetch";
import { BrowserProvider } from "ethers";
import { useAuthStore } from "@/stores/auth";
import { useCookies } from "vue3-cookies";
import { useToaster } from "@/composables/useToaster";

const { address, isConnected, walletProvider } = useWeb3Auth();
const authStore = useAuthStore();

watch(isConnected, async (isConnectedState) => {
  console.log("address", address);
  const { cookies } = useCookies();

  if (isConnectedState) {
    let { data: messageData } = await useFetch("/api/auth/message", {
      method: "POST",
      body: JSON.stringify({
        walletAddress: address.value,
      }),
    });
    if (messageData.value.status) {
      let signature = await signMessage(messageData.value.data);
      let { data: loginData } = await useFetch("/api/auth/login-or-register", {
        method: "POST",
        body: JSON.stringify({
          signature,
          address: address.value,
          chainTypeId: 1,
        }),
      });
      if (loginData.value.status) {
        authStore.setUser(loginData.value.data.user);
        authStore.setIsAuthenticated(true);
        cookies.set("BEARER", loginData.value.data.token);
        useToaster().success("You have been logged in!");
      }
    }
  } else {
    authStore.setUser(null);
    authStore.setIsAuthenticated(false);
    cookies.remove("BEARER");
  }
});

async function signMessage(message) {
  const provider = new BrowserProvider(walletProvider.value);
  const signer = await provider.getSigner();
  return await signer?.signMessage(message);
}
</script>

<template>
  <DefaultLayout>
    <RouterView />
    <AudioComponent />
  </DefaultLayout>
</template>

<style scoped></style>
