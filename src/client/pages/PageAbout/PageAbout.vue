<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>About & Legal</h1>
    <div class="app-version">Tuumik {{ appVersion }}</div>
    This software application (hereinafter "Tuumik") is developed by Tuumik Systems OÜ, a company registered in Estonia. Tuumik is protected by copyright.
    <br />
    More information available at
    <a href="https://www.tuumik.com" target="_blank" class="rlink">www.tuumik.com.</a>
    <div class="logout-holder">
      <span class="btn" @click="logoutOthers()">LOG OUT OTHER DEVICES</span>
    </div>
    <div class="tech-title">Technical references for support:</div>
    <div class="tech">User name: {{ generalStore.user.name }}</div>
    <div class="tech">User id: {{ generalStore.user._id }}</div>
    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import { appVersion } from '/src/shared/utils/app.js';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(false);

function logoutOthers() {
  loading.value = true;
  Meteor.logoutOtherClients(err => {
    if (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
      loading.value = false;
    } else {
      notifierStore.addTemp({ type: 'success', txt: 'OTHER CLIENTS LOGGED OUT' });
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.logout-holder {
  margin: 4em 0;
}

.app-version {
  margin: 0 0 1em 0;
}

.tech-title {
  margin: 2em 0 0 0;
}

.tech {
  color: #5c5c5c;
}
</style>
