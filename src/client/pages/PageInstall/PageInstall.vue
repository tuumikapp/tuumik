<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>Install App</h1>
    <div class="installed">
      Tuumik is installed on this device. There should be a shortcut to it on your desktop or home screen.
    </div>
    <div v-if="generalStore.pwaBeforeInstall" class="btn" @click="startInstall()">
      INSTALL APP ON THIS DEVICE
    </div>
  </div>
</template>

<script setup>
import { useGeneralStore } from '/src/client/stores/general.js';

const generalStore = useGeneralStore();

function startInstall() {
  generalStore.pwaBeforeInstall.prompt();
}
</script>

<style scoped>
.installed {
  display: none;
}

@media all and (display-mode: standalone) {
  .installed {
    display: block;
  }
}
</style>
