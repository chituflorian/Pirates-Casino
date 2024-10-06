<script setup></script>

<template>
  <div class="game-plan m-8 flex grow items-end justify-center p-6">
    <div class="game-container h-[1400px] w-[504px]"></div>
  </div>
</template>

<style scoped>
.game-plan {
  border-radius: 8px;
  border: 1px solid #282828;
  background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.85) 100%
    ),
    url("/pirates-background.png");
  box-shadow: 0px 16px 94px 20px rgba(0, 0, 0, 0.02);
  background-size: cover;
  background-position: 25% center;
}

.game-container {
  border: 1px solid #282828;
  background: #1a1919;
  box-shadow: 0px 16px 94px 20px rgba(0, 0, 0, 0.02);
}
</style>
