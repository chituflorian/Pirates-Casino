<template>
  <div class="flex gap-4">
    <div class="flex items-start justify-start">
      <div class="relative">
        <RouterLink to="/">
          <div class="h-12 w-12 overflow-hidden rounded-full">
            <img :src="user.profilePicture" alt="Profile picture" />
          </div>
        </RouterLink>
        <div
          class="flex-center z-1 user-badge absolute bottom-0 right-0 h-5 w-5 rounded-full"
        >
          <span class="font-outfit-medium text-sm text-woodsmoke-960">{{
            user.badgeNumber
          }}</span>
        </div>
      </div>
    </div>
    <div class="flex flex-1 flex-col gap-3">
      <div class="flex justify-between gap-4">
        <div class="flex flex-nowrap items-center gap-2">
          <h2 class="line-clamp-1 font-outfit-medium text-gallery-100">
            {{ user.username }}
          </h2>
          <div class="h-0.5 w-0.5 bg-boulder-500"></div>
          <span
            class="whitespace-nowrap font-outfit-medium text-[8px] text-boulder-500"
            >{{ moment(user.sendAt).format("LT") }}</span
          >
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <span class="w-[1ch] font-outfit-medium text-sm text-turbo-400">{{
              user.votes || ""
            }}</span>
            <ShiningButtonComponent
              :class="{ 'no-shine': !user.votes }"
              @click="triggerFavoriteAction"
            >
              <div class="flex-center h-4 w-4">
                <HeartIcon class="favorite-button h-4 w-4" />
              </div>
            </ShiningButtonComponent>
          </div>
          <div class="flex-center z-[1]">
            <ReplyIcon class="h-4 w-4" />
          </div>
        </div>
      </div>
      <div class="relative flex">
        <div class="message-container relative z-[1] flex px-4 py-2">
          <span
            class="font-outfit-medium text-sm leading-normal text-gallery-100"
            >{{ user.message }}</span
          >
        </div>
        <div
          class="message-pointer absolute-center-y left-0 h-3 w-3 -translate-x-1/2 rotate-45"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeartIcon from "@/assets/svg/heart.svg";
import ReplyIcon from "@/assets/svg/arrow-uturn-left.svg";
import moment from "moment";
import ShiningButtonComponent from "@/components/general/ShiningButtonComponent.vue";
import { ref } from "vue";
const user = ref({
  profilePicture: "/profile.jpeg",
  username: "Solanagamerr12343Solanagamerr12343",
  message:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  badgeNumber: 3,
  sendAt: new Date(),
  votes: getRandomInt(7),
});

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function triggerFavoriteAction(e) {
  if (e.currentTarget.classList.contains("no-shine")) {
    user.value.votes += 1;
  } else {
    user.value.votes -= 1;
  }
  e.currentTarget.classList.toggle("no-shine");
}
</script>

<style scoped>
.user-badge {
  border: 2px solid #1a1919;
  background: #ffe619;
  box-shadow: 0px 0px 12px 1px #ffb42c inset;
}

.favorite-button {
  fill: #ffe619;
}

.no-shine .favorite-button {
  fill: #777777;
}
.message-container {
  border-radius: 4px;
  background: #191919;
  box-shadow: 0px 0px 23px 3px #272727 inset;
}
.message-pointer {
  background: #191919;
  box-shadow: 0px 0px 23px -3px #272727 inset;
}
</style>
