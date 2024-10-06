<template>
  <div class="chat-container flex h-full w-full flex-col md:w-[400px]">
    <div
      class="flex items-center justify-between border-b border-mine-shaft-950 px-[30px] py-4"
    >
      <div class="flex items-center gap-3">
        <ShiningButtonComponent>
          <div class="flex-center h-12 w-12">
            <MessagesIcon class="fill-turbo-400" />
          </div>
        </ShiningButtonComponent>
        <div class="flex flex-col gap-1">
          <span class="font-outfit-bold text-gallery-100">Chat</span>
          <span class="font-outfit-medium text-sm text-gallery-100"
            >120 Players online</span
          >
        </div>
      </div>
      <EclipseButtonComponent>
        <div class="flex-center h-8 w-8">
          <OptionsIcon />
        </div>
      </EclipseButtonComponent>
    </div>
    <div
      class="top-overflow-chat-indicator absolute left-0 right-0 top-[80px] z-[2] w-full"
    ></div>
    <div
      class="relative flex flex-1 flex-col gap-4 overflow-auto px-[30px] py-4 [&>div:first-of-type]:relative [&>div:first-of-type]:z-[3] [&>div:last-of-type]:relative [&>div:last-of-type]:z-[3]"
    >
      <template v-for="(i, key) in new Array(20)" :key="key">
        <ChatMessageComponent />
      </template>
    </div>
    <div
      class="top-overflow-chat-indicator absolute bottom-[68px] left-0 right-0 z-[2] w-full rotate-180"
    ></div>
    <div
      class="flex items-center gap-4 border-t border-mine-shaft-950 px-[30px] py-3.5"
    >
      <input
        type="text"
        class="h-full w-full flex-1 bg-transparent text-gallery-100 placeholder:text-boulder-500 focus:outline-none"
        placeholder="Type something..."
      />
      <button class="flex-center">
        <EmotesIcon />
      </button>
      <button class="send-button flex-center h-10 w-10">
        <SendIcon />
      </button>
    </div>
  </div>
</template>

<script setup>
import MessagesIcon from "@/assets/svg/messages.svg";
import OptionsIcon from "@/assets/svg/more-options.svg";
import EmotesIcon from "@/assets/svg/emoticons.svg";
import SendIcon from "@/assets/svg/send-arrow.svg";
import ShiningButtonComponent from "@/components/general/ShiningButtonComponent.vue";
import EclipseButtonComponent from "@/components/general/EclipseButtonComponent.vue";
import ChatMessageComponent from "@/components/general/ChatMessageComponent.vue";
</script>

<style scoped>
.chat-container {
  border: 1px solid #282828;
  background: #1a1919;
  box-shadow: 0px 16px 94px 20px rgba(0, 0, 0, 0.02);
  border-top: none;
}
.send-button {
  border-radius: 8px;
  background: #ffe619;
  box-shadow: 0px 0px 18px 8px #ffb42c inset,
    0px 0px 16px 2px rgba(255, 230, 25, 0.15);
}
.top-overflow-chat-indicator {
  background: linear-gradient(180deg, #1a1919 14.06%, rgba(26, 25, 25, 0) 100%);
  @apply h-[90px] xl:h-[130px];
}
</style>
