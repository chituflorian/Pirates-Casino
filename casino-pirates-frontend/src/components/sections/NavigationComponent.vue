<template>
  <nav
    class="navigation-container relative flex items-center justify-between px-3 py-4 md:px-6 md:py-3 xxl:py-5"
  >
    <div class="relative flex items-center gap-2 md:gap-6">
      <button
        class="hidden items-center md:flex"
        @click="toggleSidebarMenuExpandedState"
      >
        <BurgerIcon class="aspect-square fill-gallery-100 md:h-6 xxl:h-7" />
      </button>
      <img
        width="73"
        height="62"
        class="h-8 w-9 w-auto md:h-[42px] xl:h-[48px] xxl:h-[62px]"
        :src="PirateIconUrl"
        alt="Pirates Casino Logo"
      />
      <div class="flex items-center">
        <h2
          class="font-outfit-bold text-white md:text-[20px] xl:text-[24px] xxl:text-[28px]"
        >
          casino
        </h2>
      </div>
    </div>
    <div class="relative flex items-center gap-4">
      <EclipseButtonComponent class="flex">
        <div class="flex items-center gap-2.5 p-2.5 md:h-10 md:p-3 xxl:h-12">
          <SoundOffIcon
            class="h-4 w-4 md:h-6 md:w-6"
            @click="rangeValue = lastRangeValue"
            v-if="parseInt(rangeValue) === 0"
          />
          <SoundOnIcon
            class="h-4 w-4 md:h-6 md:w-6"
            @click="muteVolume"
            v-else
          />
          <RangeSliderComponent v-model="rangeValue" class="hidden md:flex" />
        </div>
      </EclipseButtonComponent>
      <EclipseButtonComponent class="hidden md:flex" v-if="isAuthenticated">
        <div class="flex-center aspect-square md:h-10 xxl:h-12">
          <div class="relative h-fit w-fit">
            <NotificationIcon />
            <div
              class="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-woodsmoke-970 p-0.5"
            >
              <div class="h-full w-full rounded-full bg-turbo-400 p-0.5"></div>
            </div>
          </div>
        </div>
      </EclipseButtonComponent>
      <EclipseShiningButtonComponent
        class="hidden md:flex"
        :class="{ 'no-shine': !chatSpaceExpanded }"
        @click="toggleChatSpaceExpandedState"
      >
        <div class="flex-center aspect-square md:h-10 xxl:h-12">
          <MessagesIcon class="messages-icon aspect-square h-6" />
        </div>
      </EclipseShiningButtonComponent>
      <EclipseButtonComponent
        class="hidden !cursor-default md:flex"
        v-if="isAuthenticated"
      >
        <div class="flex items-center gap-4 p-1">
          <ShiningButtonComponent class="ml-3">
            <CoinIcon class="h-4 w-4 md:h-5 md:w-5" />
          </ShiningButtonComponent>
          <div class="flex items-center">
            <span
              class="min-w-[5ch] font-outfit-semibold text-white md:text-sm xxl:text-base"
              >{{ userBalance.toLocaleString() }}</span
            >
          </div>
          <button
            class="flex-center add-button aspect-square rounded-full bg-turbo-400 md:h-8 xxl:h-10"
          >
            <PlusIcon class="md:h-5 md:w-5 xxl:h-6 xxl:w-6" />
          </button>
        </div>
      </EclipseButtonComponent>
      <EclipseButtonComponent
        v-if="isAuthenticated"
        @click="(event) => profileMenuContainer.toggle(event)"
      >
        <div
          class="relative m-0.5 flex aspect-square h-9 items-center overflow-hidden rounded-full xxl:h-11"
        >
          <img
            src="/profile.jpeg"
            alt="Profile picture"
            class="absolute-center"
          />
        </div>
      </EclipseButtonComponent>
      <OverlayPanel
        unstyled
        ref="profileMenuContainer"
        appendTo="body"
        :close-on-escape="true"
      >
        <div
          class="profile-menu mt-4 w-[180px] rounded-lg border border-mine-shaft-950 bg-woodsmoke-960"
        >
          <div
            class="profile-menu-header flex flex-col gap-2 rounded-t-lg border-b border-mine-shaft-950 bg-shark-950 px-4 pb-4 pt-6"
          >
            <div class="flex justify-between gap-2">
              <span
                class="whitespace-nowrap font-outfit-semibold text-xs leading-tight text-turbo-400"
                >Level 9</span
              >
              <span
                class="whitespace-nowrap font-outfit-semibold text-xs leading-tight text-mountain-mist-600"
                >3281 XP</span
              >
            </div>
            <div class="range-container flex h-fit w-full items-center">
              <div
                class="range-tail h-1 rounded-l-[120px] bg-turbo-400"
                :style="{ width: '40%' }"
              ></div>
            </div>
          </div>
          <div class="p-4">
            <ul class="flex flex-col gap-4">
              <li
                :class="{ active: isActive }"
                class="w-full cursor-pointer [&.active_.profile-icon]:text-turbo-400 [&.active_span]:text-turbo-400"
              >
                <div class="flex w-fit flex-nowrap gap-1">
                  <ProfileIcon
                    class="profile-icon h-4 w-4 text-mountain-mist-600"
                  />
                  <span
                    class="font-outfit-semibold text-xs leading-tight text-mountain-mist-600"
                    >Profile</span
                  >
                </div>
              </li>
              <li class="w-full cursor-pointer">
                <div
                  class="flex w-fit flex-nowrap gap-1"
                  @click="openLogoutModal"
                >
                  <LogoutIcon class="h-4 w-4 text-coral-red-500" />
                  <span
                    class="font-outfit-semibold text-xs leading-tight text-coral-red-500"
                    >Log out</span
                  >
                </div>
              </li>
            </ul>
          </div>
        </div>
      </OverlayPanel>
      <ConfirmDialog>
        <template #message>
          <div
            class="flex-center flex-col gap-4 pb-[68px] xl:gap-6 xl:pb-[100px]"
          >
            <LogoutIcon class="h-9 w-9 text-turbo-400 xl:h-12 xl:w-12" />
            <span class="font-outfit-bold text-gallery-100 md:text-2xl"
              >Are you sure you want to log out?</span
            >
          </div>
        </template>
      </ConfirmDialog>
      <template v-if="!isAuthenticated">
        <button
          @click="openConnectWallet"
          class="connect-button md:flex-center hidden gap-2 px-4 md:h-10 xxl:h-12"
        >
          <ConnectWallet class="h-6 w-6" />
          <span class="font-outfit-bold text-woodsmoke-950"
            >Connect wallet</span
          >
        </button>
        <button @click="openConnectWallet" class="connect-button p-2 md:hidden">
          <ConnectWalletMobile class="h-5 w-5" />
        </button>
      </template>
    </div>
  </nav>
</template>

<script setup>
import OverlayPanel from "primevue/overlaypanel";
import ConfirmDialog from "primevue/confirmdialog";
import LogoutIcon from "@/assets/svg/logout.svg";
import ProfileIcon from "@/assets/svg/user.svg";
import BurgerIcon from "@/assets/svg/burger-menu.svg";
import PirateIconUrl from "@/assets/svg/pirate-casino.svg?url";
import SoundOnIcon from "@/assets/svg/sound-on.svg";
import SoundOffIcon from "@/assets/svg/sound-off.svg";
import NotificationIcon from "@/assets/svg/notification.svg";
import MessagesIcon from "@/assets/svg/messages.svg";
import CoinIcon from "@/assets/svg/coin.svg";
import ConnectWallet from "@/assets/svg/connect-wallet.svg";
import ConnectWalletMobile from "@/assets/svg/connect-wallet-mobile.svg";
import PlusIcon from "@/assets/svg/plus.svg";
import EclipseButtonComponent from "@/components/general/EclipseButtonComponent.vue";
import RangeSliderComponent from "@/components/general/RangeSliderComponent.vue";
import EclipseShiningButtonComponent from "@/components/general/EclipseShiningButtonComponent.vue";
import ShiningButtonComponent from "@/components/general/ShiningButtonComponent.vue";
import { useUiStore } from "@/stores/ui";
import { computed, onMounted, ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useWeb3Auth } from "@/composables/useWeb3Auth";
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();
const profileMenuContainer = ref(null);
const uiStore = useUiStore();
const authStore = useAuthStore();
const lastRangeValue = ref(20);
const rangeValue = ref(uiStore.getPercentageSoundVolume * 100);
const chatSpaceExpanded = uiStore.getChatSpaceExpanded;
const userBalance = computed(() => authStore.getUserBalance);
const isAuthenticated = computed(() => authStore.getIsAuthenticated);
const { openConnectWallet } = useWeb3Auth();

const confirmLogout = () => {
  confirm.require({
    acceptLabel: "No",
    rejectLabel: "Yes",
    accept: () => {
      confirm.close();
    },
    reject: () => {
      triggerUserLogout();
    },
  });
};
function toggleSidebarMenuExpandedState() {
  uiStore.setSidebarMenuExpanded(!uiStore.getSidebarMenuExpanded);
}
function toggleChatSpaceExpandedState(e) {
  e.currentTarget.classList.toggle("no-shine");
  uiStore.setChatSpaceExpanded(!uiStore.getChatSpaceExpanded);
}
function muteVolume() {
  lastRangeValue.value = rangeValue.value;
  rangeValue.value = 0;
}
watch(
  () => rangeValue.value,
  (newVolumeValue) => {
    uiStore.setPercentageSoundVolume(newVolumeValue / 100);
  }
);
const isActive = ref(true);

function openLogoutModal() {
  confirmLogout();
}

function triggerUserLogout() {
  authStore.logout();
}
</script>

<style scoped>
.add-button {
  box-shadow: 0px 0px 12px 4px #ffb42c inset;
}

.navigation-container {
  background-image: url("/navigation-bar.svg");
  background-repeat: repeat;
  background-position: center center;
  border: none;
}

.messages-icon {
  fill: #ffe619;
}
.no-shine .messages-icon {
  fill: #777777;
}

.connect-button {
  border-radius: 8px;
  background: #ffe619;
  box-shadow: 0px 0px 18px 5px #ffb42c inset,
    0px 0px 16px 2px rgba(255, 230, 25, 0.15);
}
.profile-menu-header {
  box-shadow: 0px 16px 94px 20px rgba(0, 0, 0, 0.02);
}
.profile-menu {
  box-shadow: 0px 16px 94px 20px rgba(0, 0, 0, 0.02);
}
.range-tail {
  border-radius: 120px;
  background: #ffe619;
  box-shadow: 0px 0px 8px 2px rgba(255, 230, 25, 0.25);
}
.range-container {
  border-radius: 120px;
  background: #272727;
}
</style>
