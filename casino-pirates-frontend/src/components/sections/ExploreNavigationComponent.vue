<template>
  <div class="relative z-[1] hidden justify-between px-6 py-2 md:flex xl:py-3">
    <div class="flex">
      <ul class="flex gap-4">
        <li>
          <RouterLink to="/affiliates">
            <h2
              class="font-outfit-medium text-sm text-mountain-mist-600 xl:text-sm xxl:text-base"
            >
              Affiliates
            </h2>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/fairness">
            <h2
              class="font-outfit-medium text-sm text-mountain-mist-600 xxl:text-base"
            >
              Fairness
            </h2>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/frequently-asked-questions">
            <h2
              class="font-outfit-medium text-sm text-mountain-mist-600 xxl:text-base"
            >
              FAQ
            </h2>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/responsibly">
            <h2
              class="font-outfit-medium text-sm text-mountain-mist-600 xxl:text-base"
            >
              Game responsibly
            </h2>
          </RouterLink>
        </li>
      </ul>
    </div>
    <div class="flex items-center gap-4">
      <ShiningButtonComponent>
        <TwitterIcon class="h-4 w-4 xxl:h-5 xxl:w-5" />
      </ShiningButtonComponent>
      <ShiningButtonComponent>
        <DiscordIcon class="h-4 w-4 xxl:h-5 xxl:w-5" />
      </ShiningButtonComponent>
    </div>
  </div>
</template>

<script setup>
import TwitterIcon from "@/assets/svg/twitter.svg";
import DiscordIcon from "@/assets/svg/discord.svg";
import ShiningButtonComponent from "@/components/general/ShiningButtonComponent.vue";
</script>

<style scoped></style>
