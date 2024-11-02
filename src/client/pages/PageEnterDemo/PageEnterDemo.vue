<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div class="main-pane ext-pane">
      <h2 class="top-h2">START DEMO</h2>
      <div class="demo-text">
        The live demo is a free and convenient way to quickly assess Tuumik's features in a temporary environment. It creates a sample organization with some user accounts and fills those
        accounts with randomly generated data. It showcases a law firm with lawyers tracking their work. These demo accounts will be automatically deleted after a while. Feel free to try
        out the app in the demo.
      </div>
      <div v-if="!loading" class="btn-submit" @click="createDemo()">START DEMO</div>
      <div v-if="loading" class="spinner"></div>
      <div v-if="loading">
        Creating demo accounts. Please wait.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Meteor } from 'meteor/meteor';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { useRouter } from 'vue-router';

const notifierStore = useNotifierStore();
const router = useRouter();
const loading = ref(false);

async function createDemo() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('createDemo');
    logIntoDemoAccount(res);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function logIntoDemoAccount(accountEmail) {
  Meteor.loginWithPassword(accountEmail, 'demo', err => {
    if (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
    } else {
      notifierStore.addTemp({ type: 'success', txt: 'LOGGED INTO DEMO ACCOUNT' });
      router.push('/');
    }
  });
}
</script>

<style scoped>
.demo-text {
  text-align: justify;
  margin: 0 0 0.5em 0;
}

.btn-submit {
  padding: 1em 2em;
}

.spinner {
  height: 3em;
  width: 3em;
  margin: 2em 0;
}
</style>
