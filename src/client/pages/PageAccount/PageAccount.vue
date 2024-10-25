<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>Settings</h1>
    <form class="main-pane" @submit.prevent="changePassword1()">
      <label for="old-psw" class="field-label">CURRENT PASSWORD:</label>
      <input id="old-psw" v-model="passwordOld" type="password" maxlength="50" />
      <label for="new-psw1" class="field-label">NEW PASSWORD:</label>
      <input id="new-psw1" v-model="passwordNew1" type="password" maxlength="50" />
      <div class="field-tip">At least 1 upper case, 1 lower case, 1 number. At least 8 characters.</div>
      <label for="new-psw2" class="field-label">NEW PASSWORD AGAIN:</label>
      <span v-if="passwordNew1 && passwordNew1 === passwordNew2" class="match">[MATCH]</span>
      <input id="new-psw2" v-model="passwordNew2" type="password" maxlength="50" />
      <input type="submit" value="CHANGE PASSWORD" class="btn-submit" />
    </form>
    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Accounts } from 'meteor/accounts-base';
import { isValidPasswordStrength } from '/src/client/utils/validation';

const notifierStore = useNotifierStore();

const loading = ref(false);
const passwordOld = ref('');
const passwordNew1 = ref('');
const passwordNew2 = ref('');

function changePassword1() {
  if (!passwordOld.value || !passwordNew1.value) {
    notifierStore.addTemp({ type: 'error', txt: 'PLEASE FILL ALL FIELDS' });
  } else if (passwordNew1.value !== passwordNew2.value) {
    notifierStore.addTemp({ type: 'error', txt: 'NEW PASSWORDS DO NOT MATCH' });
  } else if (!isValidPasswordStrength(passwordNew1.value)) {
    notifierStore.addTemp({ type: 'error', txt: 'INSUFFICIENT PASSWORD STRENGTH' });
  } else {
    changePassword2();
  }
}

function changePassword2() {
  loading.value = true;
  Accounts.changePassword(passwordOld.value, passwordNew1.value, err => {
    if (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
      loading.value = false;
    } else {
      notifierStore.addTemp({ type: 'success', txt: 'PASSWORD CHANGED' });
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.match {
  color: limegreen;
}

.img-holder {
  height: 20em;
  width: 20em;
  position: relative;
  box-shadow: 0 0 0.9em 0 rgba(0, 0, 0, 0.07);
  border: 1px solid #cecece;
  border-radius: 0.3em;
  background-image: url('/icons/person.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

.unsaved-notice {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.2em;
  background-color: red;
  color: white;
  border-radius: 0.2em;
}
</style>
