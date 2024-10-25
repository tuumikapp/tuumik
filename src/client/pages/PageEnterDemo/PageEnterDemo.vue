<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <form class="main-pane ext-pane" @submit.prevent="createDemo1()">
      <h2 class="top-h2">START DEMO</h2>
      <div class="demo-text">
        The live demo is a free and convenient way to quickly assess Tuumik's features in a temporary environment. It creates a sample organization with some user accounts and fills those
        accounts with randomly generated data. It showcases a law firm with lawyers tracking their work. These demo accounts will be automatically deleted after a few days. Feel free to try
        out the app in the demo.
      </div>
      <div class="demo-text2">
        You will receive the login information for the new accounts immediately via email.
      </div>
      <label for="email" class="field-label">EMAIL:</label>
      <input id="email" v-model="email" type="text" maxlength="100" />
      <input v-if="!loading" type="submit" value="START DEMO" class="btn-submit" />
      <div v-if="loading" class="spinner"></div>
      <div v-if="loading">
        Creating demo accounts. Please wait.
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Meteor } from 'meteor/meteor';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { useRouter } from 'vue-router';
import { isValidEmailAddress } from '/src/client/utils/validation.js';

const notifierStore = useNotifierStore();
const router = useRouter();
const email = ref('');
const loading = ref(false);

function createDemo1() {
  if (!isValidEmailAddress(email.value)) {
    notifierStore.addTemp({ type: 'error', txt: 'INVALID EMAIL ADDRESS' });
  } else {
    createDemo2();
  }
}

async function createDemo2() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('insertDemoData', email.value);
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

.demo-text2 {
  text-align: justify;
  margin: 1em 0 0 0;
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
