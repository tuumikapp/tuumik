<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="notifier-holder">
    <GlobalNotifierMessage v-for="message in notifierStore.messages" :key="message.id" :message="message" />
  </div>
</template>

<script setup>
import { useNotifierStore } from '/src/client/stores/notifier.js';
import GlobalNotifierMessage from './components/GlobalNotifierMessage.vue';

const notifierStore = useNotifierStore();
</script>

<style scoped>
.notifier-holder {
  position: fixed;
  top: 6em;
  right: 0;
  z-index: 1000;
}
</style>
