<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div class="main-pane ext-pane">
      <h2 class="top-h2">PASSWORD RESET</h2>
      <div v-if="!generalStore.settings.email">Sending email is not enabled on this server.</div>
      <form v-else-if="!linkSent" @submit.prevent="sendLink1()">
        <label for="email" class="field-label">EMAIL:</label>
        <input id="email" v-model="email" type="text" maxlength="100" />
        <input type="submit" value="SEND RESET EMAIL" class="btn-submit" />
      </form>
      <div v-else>Password reset link sent to email address.</div>
    </div>
    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import { isValidEmailAddress } from '/src/client/utils/validation';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(false);
const email = ref('');
const linkSent = ref(false);

function sendLink1() {
  if (!email.value) {
    notifierStore.addTemp({ type: 'error', txt: 'PLEASE FILL EMAIL ADDRESS' });
  } else if (!isValidEmailAddress(email.value)) {
    notifierStore.addTemp({ type: 'error', txt: 'INVALID EMAIL ADDRESS' });
  } else {
    sendLink2();
  }
}

async function sendLink2() {
  loading.value = true;
  try {
    await Meteor.callAsync('sendEmailResetLink', email.value);
    linkSent.value = true;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>
