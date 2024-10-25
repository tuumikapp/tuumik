<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div
    :class="{ 'type-success': message.type === 'success', 'type-error': message.type === 'error', 'type-info': message.type === 'info' }" class="message-holder">
    {{ message.txt }}
    <div class="manual-close" @click="notifierStore.removeMessage(message.id)"></div>
  </div>
</template>

<script setup>
import { useNotifierStore } from '/src/client/stores/notifier.js';
const notifierStore = useNotifierStore();

const props = defineProps({
  message: Object
});
</script>

<style scoped>
.message-holder {
  width: 20em;
  max-width: 60vw;
  padding: 2em 6em 2em 2em;
  margin: 0.5em 0;
  background-color: white;
  color: #3a3a3a;
  border-radius: 0.4em 0 0 0.4em;
  position: relative;
}

.type-success {
  background-color: #00ab6a;
  border: 1px solid #272727;
  color: #ffffff;
}

.type-error {
  background-color: #ee4e32;
  border: 1px solid #272727;
  color: #ffffff;
}

.type-info {
  background-color: #ffa500;
  border: 1px solid #272727;
  color: #3a3a3a;
}

.manual-close {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 4em;
  background-color: rgba(0, 0, 0, 0.2);
  background-image: url('/icons/close-light.svg');
  background-repeat: no-repeat;
  background-size: 1.2em auto;
  background-position: center center;
}

.manual-close:hover {
  background-color: rgba(0, 0, 0, 0.4);
}
</style>
