<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <form class="main-pane ext-pane" @submit.prevent="resetPassword1()">
      <h2 class="top-h2">PASSWORD RESET</h2>
      <label for="psw-first" class="field-label">NEW PASSWORD:</label>
      <input id="psw-first" v-model="password1" type="password" maxlength="100" />
      <label for="psw-second" class="field-label">NEW PASSWORD AGAIN:</label>
      <input id="psw-second" v-model="password2" type="password" maxlength="100" />
      <input type="submit" value="RESET PASSWORD" class="btn-submit" />
    </form>
    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Accounts } from 'meteor/accounts-base';
import { isValidPasswordStrength } from '/src/client/utils/validation';

const router = useRouter();
const route = useRoute();
const notifierStore = useNotifierStore();

const loading = ref(false);
const password1 = ref('');
const password2 = ref('');

function resetPassword1() {
  if (!password1.value || !password2.value) {
    notifierStore.addTemp({ type: 'error', txt: 'PLEASE FILL ALL FIELDS' });
  } else if (password1.value !== password2.value) {
    notifierStore.addTemp({ type: 'error', txt: 'NEW PASSWORDS DO NOT MATCH' });
  } else if (!isValidPasswordStrength(password1.value)) {
    notifierStore.addTemp({ type: 'error', txt: 'INSUFFICIENT PASSWORD STRENGTH' });
  } else {
    resetPassword2();
  }
}

function resetPassword2() {
  loading.value = true;
  const token = route.params.token;
  Accounts.resetPassword(token, password1.value, err => {
    if (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
      loading.value = false;
    } else {
      notifierStore.addTemp({ type: 'success', txt: 'PASSWORD CHANGED' });
      router.push('/');
      loading.value = false;
    }
  });
}
</script>
