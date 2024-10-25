<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>New User</h1>
    <form class="main-pane" @submit.prevent="addUser1()">
      <label for="name" class="field-label">NAME:</label>
      <input id="name" v-model="name" type="text" maxlength="50" />
      <label for="email" class="field-label">EMAIL:</label>
      <input id="email" v-model="email" type="text" maxlength="50" />
      <label for="password" class="field-label">PASSWORD:</label>
      <input id="password" v-model="password" type="password" maxlength="50" />
      <div class="field-tip">At least 1 upper case, 1 lower case, 1 number. At least 8 characters.</div>
      <input type="submit" value="CREATE USER" class="btn-submit" />
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import { hashPassword } from '/src/client/utils/accounts';
import { isValidEmailAddress, isValidPasswordStrength } from '/src/client/utils/validation';

const router = useRouter();
const notifierStore = useNotifierStore();

const loading = ref(false);
const name = ref('');
const email = ref('');
const password = ref('');

function addUser1() {
  if (!name.value || !email.value || !password.value) {
    notifierStore.addTemp({ type: 'error', txt: 'PLEASE FILL ALL FIELDS' });
  } else {
    addUser2();
  }
}

function addUser2() {
  if (!isValidEmailAddress(email.value)) {
    notifierStore.addTemp({ type: 'error', txt: 'INVALID EMAIL ADDRESS' });
  } else {
    addUser3();
  }
}

function addUser3() {
  if (!isValidPasswordStrength(password.value)) {
    notifierStore.addTemp({ type: 'error', txt: 'INSUFFICIENT PASSWORD STRENGTH' });
  } else {
    addUser4();
  }
}

async function addUser4() {
  loading.value = true;
  const password2 = hashPassword(password.value);
  try {
    const res = await Meteor.callAsync('addUser', name.value, email.value, password2);
    notifierStore.addTemp({ type: 'success', txt: 'USER CREATED' });
    router.push({ name: 'userEdit', params: { userId: res } });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>
