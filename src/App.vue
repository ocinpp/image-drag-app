<!-- src/App.vue -->
<template>
  <div class="container mx-auto p-3">
    <h1 class="text-xl font-bold mb-4">Your Emotions</h1>
    <p class="text-base mb-4">What do you feel?</p>
    <NamedZoneImageDrag />
  </div>
</template>

<script setup>
import NamedZoneImageDrag from "./components/NamedZoneImageDrag.vue";
</script>
